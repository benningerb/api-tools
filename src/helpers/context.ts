import { Context } from 'koa';
import { DeepReadonly } from 'utility-types';

export interface IMinimalKoaCtx<THeaderValue = string, TQueryValue = string, TState = Record<string, unknown>> {
	headers?: Record<string, THeaderValue>;
	query?: Record<string, TQueryValue>;
	state: TState;
}

export const getHeaderValue = (
	ctx: DeepReadonly<Context>,
	headerKey: string,
	caseSensitive: boolean = false,
): string | undefined => {
	const headersAsRecord: Record<string, unknown> = (ctx.headers as Record<string, unknown>) || {};
	const headerValue = caseSensitive ? headersAsRecord[headerKey] : caseInsensitiveGetter(headersAsRecord, headerKey);

	return typeof headerValue === 'string' ? headerValue : undefined;
};

export const getQueryValue = (
	ctx: DeepReadonly<Context>,
	queryKey: string,
	caseSensitive: boolean = false,
): string | undefined => {
	const queryAsRecord: Record<string, unknown> = (ctx.query as Record<string, unknown>) || {};
	const queryValue = caseSensitive ? queryAsRecord[queryKey] : caseInsensitiveGetter(queryAsRecord, queryKey);

	return typeof queryValue === 'string' ? queryValue : undefined;
};

export const getStateValue = <T>(
	ctx: DeepReadonly<Context>,
	stateKey: string,
	caseSensitive: boolean = false,
): T | undefined => {
	const stateAsRecord = (ctx.state as Record<string, T>) || {};
	const stateValue = caseSensitive
		? stateAsRecord[stateKey]
		: caseInsensitiveGetter<Record<string, T>, string, T>(stateAsRecord, stateKey);

	return stateValue ? stateValue : undefined;
};

export const setStateValue = (ctx: Context, stateKey: string, stateValue: string): Context => {
	// initialize state if it doesn't already exist
	if (!ctx.state) ctx.state = {};

	const ctxState = ctx.state as Record<string, unknown>;
	ctxState[stateKey] = stateValue;

	return ctx;
};

function caseInsensitiveGetter<T extends Record<K, V>, K extends string | number | symbol, V>(
	obj: T,
	key: keyof T,
): V | undefined {
	const makeInsensitive = (someKey: keyof T) => {
		return typeof someKey === 'string' ? someKey.toLowerCase() : someKey;
	};

	// tslint:disable-next-line: no-unnecessary-initializer
	let valueToReturn: V | undefined = undefined;
	for (const aKeyOnObj in obj) {
		if (obj.hasOwnProperty(aKeyOnObj) && makeInsensitive(key) === makeInsensitive(aKeyOnObj)) {
			valueToReturn = obj[aKeyOnObj];
		}
	}
	return valueToReturn;
}
