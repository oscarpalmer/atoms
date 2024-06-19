import type { ArrayOrPlainObject, Key, PlainObject, Primitive } from './models';
/**
 * Is the value an array or a record?
 */
export declare function isArrayOrPlainObject(value: unknown): value is ArrayOrPlainObject;
/**
 * Is the array or object completely empty or only containing `null` or `undefined` values?
 */
export declare function isEmpty(value: ArrayOrPlainObject): boolean;
/**
 * Is the value a key?
 */
export declare function isKey(value: unknown): value is Key;
/**
 * Is the value undefined or null?
 */
export declare function isNullable(value: unknown): value is undefined | null;
/**
 * Is the value undefined, null, or an empty string?
 */
export declare function isNullableOrEmpty(value: unknown): value is undefined | null | '';
/**
 * Is the value undefined, null, or a whitespace-only string?
 */
export declare function isNullableOrWhitespace(value: unknown): value is undefined | null | '';
/**
 * Is the value a number?
 */
export declare function isNumber(value: unknown): value is number;
/**
 * Is the value a number, or a number-like string?
 */
export declare function isNumerical(value: unknown): value is number | `${number}`;
/**
 * Is the value an object?
 */
export declare function isObject(value: unknown): value is object;
/**
 * Is the value a plain object?
 */
export declare function isPlainObject(value: unknown): value is PlainObject;
/**
 * Is the value a primitive value?
 */
export declare function isPrimitive(value: unknown): value is Primitive;
