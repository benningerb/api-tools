import Router from 'koa-router';
import { Context } from 'koa';
import Boom from '@hapi/boom';
import { ILogger } from '../utils/logger';
import { getHeaderValue, getQueryValue } from '../helpers/ctxHelpers';

export interface IHaveToken {
    bearerToken: string;
}

export const ensureBearerToken = (opts: { logger: ILogger }): Router.IMiddleware => async (ctx, next) => {
    if (ctx.method === 'OPTIONS') {
        await next();
    } else {
        ctx = checkBearerTokenExists(ctx, opts);
        await next();
    }
};

export const checkBearerTokenExists = <T extends Context>(ctx: T, opts: { logger: ILogger }): T & IHaveToken => {
    const { logger } = opts;
    const authorizationHeader = getHeaderValue(ctx, { key: 'authorization', logger });
    const queryKeyForToken = 'token';
    const authorizationQueryParam = getQueryValue(ctx, { key: queryKeyForToken, logger });
    const generalUnauthorizedErr = Boom.unauthorized('Authorization bearer token not provided or in incorrect format');

    let tokenStr: string;
    if (authorizationHeader !== undefined) {
        if (authorizationHeader === '') {
            throw Boom.unauthorized('Could not find an Authorization header value');
        }
        const bearerPattern = /[Bb]earer (\S*)/;
        const tokenMatch = authorizationHeader.match(bearerPattern);
        if (!tokenMatch || !tokenMatch[1]) {
            throw generalUnauthorizedErr;
        }
        tokenStr = tokenMatch[1];
    } else if (authorizationQueryParam !== undefined) {
        if (authorizationQueryParam === '') {
            throw Boom.unauthorized(`Could not find a query value for ${queryKeyForToken}`);
        }
        const tokenMatch = authorizationQueryParam.match(/(\S*)/);
        if (!tokenMatch || !tokenMatch[1]) {
            throw generalUnauthorizedErr;
        }
        tokenStr = tokenMatch[1];
    } else {
        throw Boom.unauthorized('Could not find an Authorization header');
    }

    // While it's nice to have pure functions, we're going to add this to the state too to make sure it plays well with existing middleware
    const ctxState = (ctx.state as Record<string, unknown>) || {};
    ctxState.accessToken = tokenStr;

    // Now we return the type-safe object so that consumers will have a strongly-typed version of the ctx
    return Object.assign({}, ctx, {
        bearerToken: tokenStr,
    });
};