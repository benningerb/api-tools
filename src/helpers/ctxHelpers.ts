import util from 'util';
import { Context } from 'koa';
import { DeepReadonly } from 'utility-types';
import { ILogger } from '../utils/logger';

export interface IGetterHelperOpts {
    key: string;
    caseSensitive?: boolean;
    logger: ILogger;
}

export const getHeaderValue = (
    context: DeepReadonly<Context>,
    opts: IGetterHelperOpts
): string | undefined => {
    const { key, logger, caseSensitive = false } = opts;
    const headersAsRecord: Record<string, unknown> = (context.headers as Record<string, unknown>) || {};
    const headerValue = caseSensitive
        ? headersAsRecord[key]
        : caseInsensitiveGetter(headersAsRecord, key);
    if (typeof headerValue === 'string') {
        return headerValue;
    } else {
        logger.warn(
            `unexpected value for ctx.headers.${key}. The whole ctx.headers object: ${util.format(
                context.headers,
            )}`,
        );
        return undefined;
    }
};

export const getQueryValue = (
    context: DeepReadonly<Context>,
    opts: IGetterHelperOpts
): string | undefined => {
    const { key, logger, caseSensitive = false } = opts;
    const queryAsRecord: Record<string, unknown> = (context.query as Record<string, unknown>) || {};
    const queryValue = caseSensitive ? queryAsRecord[key] : caseInsensitiveGetter(queryAsRecord, key);
    if (typeof queryValue === 'string') {
        return queryValue;
    } else {
        logger.warn(
            `unexpected value for ctx.query.${key}. The whole ctx.query object: ${util.format(context.query)}`,
        );
        return undefined;
    }
};

export const getStateValue = <T>(
    context: DeepReadonly<Context>,
    opts: IGetterHelperOpts
): T | undefined => {
    const { key, logger, caseSensitive = false } = opts;
    const stateAsRecord = (context.state as Record<string, T>) || {};
    const stateValue = caseSensitive
        ? stateAsRecord[key]
        : caseInsensitiveGetter<Record<string, T>, string, T>(stateAsRecord, key);
    if (stateValue) {
        return stateValue;
    } else {
        logger.warn(
            `unexpected value for ctx.state.${key}. The whole ctx.state object: ${util.format(context.state)}`,
        );
        return undefined;
    }
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