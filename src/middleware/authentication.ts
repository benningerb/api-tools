import Boom from '@hapi/boom';

import { decodeAccessToken, IAccessTokenDecoded } from '../services/idm';
import { IHaveToken } from './authorization';
import { IMinimalKoaCtx } from './minimalKoaCtx';
import { IHaveCorrelationId } from './requestId';
import { envVars } from '../config/env';
import { defaultLogger as logger } from '../utils/logger';

const CLIENT_WHITELIST = [
    'myConsumerLocal',
    'myConsumer',
    envVars.get('IDM_CLIENT_ID'),
    'superSuit',
    'superSuit_awsqa',
    'superSuit_awsstage',
];

interface IHaveDecodedToken {
    decodedToken: IAccessTokenDecoded;
}
export const evaluateAuthenticatedContext = async <T extends IMinimalKoaCtx & IHaveToken & IHaveCorrelationId>(
    ctx: T,
): Promise<T & IHaveDecodedToken> => {
    // tslint:disable-next-line: no-unsafe-any
    const ctxState = ctx.state || {};

    const token = ctxState.accessToken ? ctxState.accessToken : null;
    if (!token || typeof token !== 'string') {
        throw Boom.badRequest('No token found!');
    }

    try {
        // use sub aka subject from decoded token
        // --> learn more here: https://www.oauth.com/oauth2-servers/access-tokens/self-encoded-access-tokens/
        // sometimes flid will be null (e.g. when the user is deactivated)
        const decodedToken = await decodeAccessToken(token, ctx.correlationId);
        if (!isClientAllowed(decodedToken.client_id)) {
            logger.error({ token }, 'ensureAuthenticated error. No sub and not client credential.');
            throw Boom.badRequest('Unauthorized!');
        }

        return Object.assign({}, ctx, {
            decodedToken: decodedToken,
        });
    } catch (err) {
        const e = err as Error;
        logger.error({ error: e.message, token }, 'ensureAuthenticated error. Decoding token');
        throw Boom.unauthorized(e.message);
    }
};

/**
 * Returns true if provided clientId is found in client whitelist
 * @param {string} clientId
 * @returns {boolean}
 */
export function isClientAllowed(clientId: string): boolean {
    return CLIENT_WHITELIST.includes(clientId);
}