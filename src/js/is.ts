import type {ArrayOrPlainObject, PlainObject, Primitive} from './models';
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
 * Is the value undefined or null?
 */
export function isNullable(value: unknown): value is undefined | null {
	return value == null;
}

/**
 * Is the value undefined, null, or an empty string?
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
