import Router from 'koa-router';

// defaults
const HEADER_KEY = 'x-response-time';
const PRECISION = 3;

export interface IResponseTimeOptions {
	headerKey?: string;
	precision?: number;
}

export const responseTime = (options: IResponseTimeOptions = {}): Router.IMiddleware => {
	const { headerKey = HEADER_KEY, precision = PRECISION } = options;

	const nsInS = 1e3; // nanoseconds in one second
	const msInNs = 1e6; // milliseconds in one nanosecond

	return async (ctx, next) => {
		const start = process.hrtime();
		await next();

		const [seconds, nanoseconds] = process.hrtime(start);
		const diff = seconds * nsInS + nanoseconds / msInNs;

		ctx.set(headerKey, diff.toFixed(precision) + 'ms');
	};
};
