import {getArray} from './array/get';
import {isNumber} from './internal/is';
import {getString} from './internal/string';
import type {Primitive} from './models';

// #region Functions

/**
 * Is the value empty, or only containing `null` or `undefined` values?
 * @param value Object to check
 * @returns `true` if the object is considered empty, otherwise `false`
 */
export function isEmpty(value: unknown): boolean {
	if (value == null) {
		return true;
	}

	if (typeof value === 'string') {
		return value.length === 0;
	}

	const values = getArray(value);
	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		if (values[index] != null) {
			return false;
		}
	}

	return true;
}

/**
 * Is the value `undefined` or `null`?
 * @param value Value to check
 * @returns `true` if the value is `undefined` or `null`, otherwise `false`
 */
export function isNullable(value: unknown): value is undefined | null {
	return value == null;
}

/**
 * Is the value `undefined`, `null`, or an empty _(no whitespace)_ string?
 * @param value Value to check
 * @returns `true` if the value is nullable or an empty string, otherwise `false`
 */
export function isNullableOrEmpty(value: unknown): value is undefined | null | '' {
	return value == null || getString(value) === '';
}

/**
 * Is the value `undefined`, `null`, or a whitespace-only string?
 * @param value Value to check
 * @returns `true` if the value is nullable or a whitespace-only string, otherwise `false`
 */
export function isNullableOrWhitespace(value: unknown): value is undefined | null | '' {
	return value == null || EXPRESSION_WHITESPACE.test(getString(value));
}

/**
 * Is the value a number or a number-like string?
 * @param value Value to check
 * @returns `true` if the value is a number or a parseable string, otherwise `false`
 */
export function isNumerical(value: unknown): value is number | `${number}` {
	return (
		isNumber(value) ||
		(typeof value === 'string' && value.trim().length > 0 && !Number.isNaN(+value))
	);
}

/**
 * Is the value an object _(or function)_?
 * @param value Value to check
 * @returns `true` if the value matches, otherwise `false`
 */
export function isObject(value: unknown): value is object {
	return (typeof value === 'object' && value !== null) || typeof value === 'function';
}

/**
 * - Is the value a primitive value?
 * @param value Value to check
 * @returns `true` if the value matches, otherwise `false`
 */
export function isPrimitive(value: unknown): value is Primitive {
	return value == null || EXPRESSION_PRIMITIVE.test(typeof value);
}

// #endregion

// #region Constants

const EXPRESSION_PRIMITIVE = /^(bigint|boolean|number|string|symbol)$/;

const EXPRESSION_WHITESPACE = /^\s*$/;

// #endregion

// #region Exports

export {
	isArrayOrPlainObject,
	isConstructor,
	isKey,
	isNumber,
	isPlainObject,
	isTypedArray,
} from './internal/is';

export type {
	ArrayOrPlainObject,
	Constructor,
	Key,
	PlainObject,
	Primitive,
	TypedArray,
} from './models';

// #endregion
