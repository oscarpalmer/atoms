import type {ArrayOrPlainObject, Key, PlainObject, Primitive} from './models';
import {getString} from './string';

/**
 * Is the value an array or a record?
 */
export function isArrayOrPlainObject(
	value: unknown,
): value is ArrayOrPlainObject {
	return Array.isArray(value) || isPlainObject(value);
}

/**
 * Is the array or object completely empty or only containing `null` or `undefined` values?
 */
export function isEmpty(value: ArrayOrPlainObject): boolean {
	if (Array.isArray(value)) {
		return (
			value.length === 0 || value.filter(item => item != null).length === 0
		);
	}

	const values = Object.values(value);

	return (
		values.length === 0 || values.filter(item => item != null).length === 0
	);
}

/**
 * Is the value a key?
 */
export function isKey(value: unknown): value is Key {
	return typeof value === 'number' || typeof value === 'string';
}

/**
 * Is the value undefined or null?
 */
export function isNullable(value: unknown): value is undefined | null {
	return value == null;
}

/**
 * Is the value undefined, null, or an empty string?
 */
export function isNullableOrEmpty(
	value: unknown,
): value is undefined | null | '' {
	return value == null || getString(value) === '';
}

/**
 * Is the value undefined, null, or a whitespace-only string?
 */
export function isNullableOrWhitespace(
	value: unknown,
): value is undefined | null | '' {
	return value == null || /^\s*$/.test(getString(value));
}

/**
 * Is the value a number?
 */
export function isNumber(value: unknown): value is number {
	return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Is the value a number, or a number-like string?
 */
export function isNumerical(value: unknown): value is number | `${number}` {
	return (
		isNumber(value) ||
		(typeof value === 'string' &&
			value.trim().length > 0 &&
			!Number.isNaN(+value))
	);
}

/**
 * Is the value an object?
 */
export function isObject(value: unknown): value is object {
	return (
		(typeof value === 'object' && value !== null) || typeof value === 'function'
	);
}

/**
 * Is the value a plain object?
 */
export function isPlainObject(value: unknown): value is PlainObject {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);

	return (
		(prototype === null ||
			prototype === Object.prototype ||
			Object.getPrototypeOf(prototype) === null) &&
		!(Symbol.toStringTag in value) &&
		!(Symbol.iterator in value)
	);
}

/**
 * Is the value a primitive value?
 */
export function isPrimitive(value: unknown): value is Primitive {
	return (
		value == null ||
		/^(bigint|boolean|number|string|symbol)$/.test(typeof value)
	);
}
