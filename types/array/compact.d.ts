/**
 * Compacts and returns an array with all falsey values removed
 */
export declare function compact<Value>(array: Value[], strict: true): Exclude<Value, 0 | '' | false | null | undefined>[];
/**
 * Compacts and returns an array with all `null` and `undefined` values removed
 */
export declare function compact<Value>(array: Value[]): Exclude<Value, null | undefined>[];
