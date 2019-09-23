import Boom from '@hapi/boom';

import { decodeAccessToken, IAccessTokenDecoded } from '../services/idm';
import { IHaveToken } from './authorization';
import { IMinimalKoaCtx } from '../helpers/minimalKoaCtx';
import { IHaveCorrelationId } from './requestId';
import { ILogger } from '../utils/logger';

export interface IHaveDecodedToken {
    decodedToken: IAccessTokenDecoded;
}

export const evaluateAuthenticatedContext = (opts: { clientWhitelist: string[], logger?: ILogger }) => async <T extends IMinimalKoaCtx & IHaveToken & IHaveCorrelationId>(
    ctx: T,
): Promise<T & IHaveDecodedToken> => {
    // tslint:disable-next-line: no-unsafe-any
    const ctxState = ctx.state || {};

    const token = ctxState.accessToken ? ctxState.accessToken : null;
    if (!token || typeof token !== 'string') {
        throw Boom.badRequest('No token found!');
    }

    // tslint:disable-next-line:no-console
    const logger = opts.logger || console;

    try {
        // use sub aka subject from decoded token
        // --> learn more here: https://www.oauth.com/oauth2-servers/access-tokens/self-encoded-access-tokens/
        // sometimes flid will be null (e.g. when the user is deactivated)
        const decodedToken = await decodeAccessToken({
            accessToken: token,
            correlationId: ctx.correlationId,
            logger: opts.logger
        });
        if (!opts.clientWhitelist.includes(decodedToken.client_id)) {
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