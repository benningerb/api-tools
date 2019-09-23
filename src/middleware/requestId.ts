import Router from 'koa-router';
import shortId from 'shortid';
import { getHeaderValue } from '../helpers/ctxHelpers';
import { Context } from 'koa';

export const CORRELATION_ID_HEADER_KEY = 'x-fl-hop-correlationid';

export const insertCorrelationId = (): Router.IMiddleware => async (ctx, next) => {
    ctx = addCorrelationIdToCtx(ctx);
    await next();
};

export interface IHaveCorrelationId {
    correlationId: string;
}

export const addCorrelationIdToCtx = <T extends Context>(ctx: T): T & IHaveCorrelationId => {
    const correlationIdFromConsumer = getHeaderValue(ctx, CORRELATION_ID_HEADER_KEY);
    const definitelyACorrelationId = correlationIdFromConsumer || shortId.generate();
    // While it's nice to have pure functions, we're going to add this to the state too to make sure it plays well with existing middleware
    const ctxStateAsRecord = (ctx.state as Record<string, unknown>) || {};
    ctxStateAsRecord.correlationId = definitelyACorrelationId;
    // Now we return the type-safe object so that consumers will have a strongly typed version of the ctx
    return Object.assign(ctx, {
        correlationId: definitelyACorrelationId,
    });
};