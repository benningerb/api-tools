import Router from 'koa-router';

import { parse } from '../lib/odata-query';
import { setStateValue } from '../helpers/context';

export const parseOData = (): Router.IMiddleware => {
	return async (ctx, next) => {
		if (ctx.querystring) {
			const decoded = decodeURI(ctx.querystring);
			setStateValue(ctx, 'odata', parse(decoded));
		}

		await next();
	};
};
