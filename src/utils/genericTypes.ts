export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>> // tslint:disable-next-line:no-shadowed-variable
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

export const notNullOrUndefined = <TValue>(value: TValue | null | undefined): value is TValue => {
    return value !== null && value !== undefined;
};
export const isNotNullOrUndefined = notNullOrUndefined;

// tslint:disable-next-line:no-any
export const isString = (arg: any): arg is string => {
    return arg !== undefined && typeof arg === 'string';
};

/**
 * A safe alternative to Object.keys (which often throws a no-index error due to a concern that all dynamic objects can have excess properties. Read more here: https://github.com/Microsoft/TypeScript/pull/12253#issuecomment-263132208 )
 * @param anObject
 * @param safeKeys a list of key names that you would like to get back
 */
export function ObjectDotKeysSafe<T extends object>(anObject: T, safeKeys: Array<keyof T>): Array<keyof T> {
    return (Object.keys(anObject) as Array<keyof T>).filter(aKey => safeKeys.includes(aKey));
}

/** Since Object.keys can not infer the type of the key if it's a string union, this function will preserve the string union */
export function getRecordKeys<K extends string>(keyPairs: Record<K, unknown>): K[] {
    const arrayOfKeys: K[] = [];
    for (const iterator in keyPairs) {
        if (keyPairs.hasOwnProperty(iterator)) {
            arrayOfKeys.push(iterator);
        }
    }
    return arrayOfKeys;
}

/**
 * A type-safe alternative to anArray[0]
 * @param anArray any array that you want the first element of
 */
export function firstOrNull<T>(anArray: T[]): T | null {
    const firstItem = anArray[0];
    // Notice that the variable's type is "T" instead of the more desireable "T | null"
    // But in reality, it's very possible that it could be falsy at runtime. So we check that like it's old-school JS
    if (!firstItem) {
        return null;
    }
    return firstItem;
}

/**
 * When you are ABSOLUTELY certain that there is only 1 item in the array. It's almost always safer to use firstOrNull instead
 * @param anArray any array that you want the first element of
 */
export function firstOrThrow<T>(anArray: T[], errorMsgToThrow?: string): T {
    const firstItem = firstOrNull(anArray);

    if (!firstItem) {
        throw new Error(errorMsgToThrow || 'The array was empty');
    }

    return firstItem;
}