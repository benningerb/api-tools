import Router from 'koa-router';
import shortId from 'shortid';
import { getHeaderValue, setStateValue } from '../helpers/context';
import { Context } from 'koa';

// defaults
export const HEADER_KEY = 'x-request-id';

export interface IRequestIdOptions {
	headerKey?: string;
}

export const requestId = (options: IRequestIdOptions = {}): Router.IMiddleware => {
    const { headerKey = HEADER_KEY } = options;
    
	return async (ctx, next) => {
		ctx = addRequestIdToState(ctx, headerKey);
		await next();
	};
};

export const addRequestIdToState = <T extends Context>(ctx: T, headerKey: string): T => {
	const requestIdValue = getHeaderValue(ctx, headerKey) || shortId.generate();
    setStateValue(ctx, 'requestId', requestIdValue);
	return ctx;
};
