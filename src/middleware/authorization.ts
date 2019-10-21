import Boom from '@hapi/boom';
import { Context } from 'koa';
import Router from 'koa-router';

import { getHeaderValue, getQueryValue, setStateValue } from '../helpers/context';

export const ensureBearerToken: Router.IMiddleware = async (ctx, next) => {
	if (ctx.method !== 'OPTIONS') {
		ctx = checkBearerTokenExists(ctx);
	}
	await next();
};

export const checkBearerTokenExists = <T extends Context>(ctx: T): T => {
	const queryKeyForToken = 'token';
	const authorizationHeader = getHeaderValue(ctx, 'authorization');
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

	setStateValue(ctx, 'accessToken', tokenStr);
	return ctx;
};
