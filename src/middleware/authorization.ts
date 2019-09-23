import Router from 'koa-router';
import { getHeaderValue, getQueryValue } from '../helpers/ctxHelpers';
import { Context } from 'koa';
import Boom from '@hapi/boom';

export interface IHaveToken {
    bearerToken: string;
}

export const ensureBearerToken = (): Router.IMiddleware => async (ctx, next) => {
    if (ctx.method === 'OPTIONS') {
        await next();
    } else {
        ctx = checkBearerTokenExists(ctx);
        await next();
    }
};

export const checkBearerTokenExists = <T extends Context>(ctx: T): T & IHaveToken => {
    const authorizationHeader = getHeaderValue(ctx, 'authorization');
    const queryKeyForToken = 'token';
    const authorizationQueryParam = getQueryValue(ctx, queryKeyForToken);
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