import util from 'util';
import { Context } from 'koa';
import { DeepReadonly } from 'utility-types';
import { defaultLogger as logger } from '..';

export const getHeaderValue = (
    context: DeepReadonly<Context>,
    headerKeyToGet: string,
    caseSensitive: boolean = false,
): string | undefined => {
    const headersAsRecord: Record<string, unknown> = (context.headers as Record<string, unknown>) || {};
    const headerValue = caseSensitive
        ? headersAsRecord[headerKeyToGet]
        : caseInsensitiveGetter(headersAsRecord, headerKeyToGet);
    if (typeof headerValue === 'string') {
        return headerValue;
    } else {
        logger.warn(
            `unexpected value for ctx.headers.${headerKeyToGet}. The whole ctx.headers object: ${util.format(
                context.headers,
            )}`,
        );
        return undefined;
    }
};

export const getQueryValue = (
    context: DeepReadonly<Context>,
    queryKeyToGet: string,
    caseSensitive: boolean = false,
): string | undefined => {
    const queryAsRecord: Record<string, unknown> = (context.query as Record<string, unknown>) || {};
    const queryValue = caseSensitive ? queryAsRecord[queryKeyToGet] : caseInsensitiveGetter(queryAsRecord, queryKeyToGet);
    if (typeof queryValue === 'string') {
        return queryValue;
    } else {
        logger.warn(
            `unexpected value for ctx.query.${queryKeyToGet}. The whole ctx.query object: ${util.format(context.query)}`,
        );
        return undefined;
    }
};

export const getStateValue = <T>(
    context: DeepReadonly<Context>,
    stateKeyToGet: string,
    caseSensitive: boolean = false,
): T | undefined => {
    const stateAsRecord = (context.state as Record<string, T>) || {};
    const stateValue = caseSensitive
        ? stateAsRecord[stateKeyToGet]
        : caseInsensitiveGetter<Record<string, T>, string, T>(stateAsRecord, stateKeyToGet);
    if (stateValue) {
        return stateValue;
    } else {
        logger.warn(
            `unexpected value for ctx.state.${stateKeyToGet}. The whole ctx.state object: ${util.format(context.state)}`,
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