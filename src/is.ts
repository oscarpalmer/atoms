import {getArray} from './array/get';
import {isNumber} from './internal/is';
import {getString} from './internal/string';

// #region Functions

/**
 * Is the value empty, or only containing `null` or `undefined` values?
 * @param value Value to check
 * @returns `true` if the value is considered empty, otherwise `false`
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
 * Is the value not empty, or holding non-empty values?
 * @param value Value to check
 * @returns `true` if the value is not considered empty, otherwise `false`
 */
export function isNonEmpty(value: unknown): boolean {
	return !isEmpty(value);
}

/**
 * Is the value not `undefined` or `null`?
 * @param value Value to check
 * @returns `true` if the value is not `undefined` or `null`, otherwise `false`
 */
export function isNonNullable<Value>(value: Value): value is Exclude<Value, undefined | null> {
	return value != null;
}

/**
 * Is the value not `undefined`, `null`, or stringified as an empty _(no whitespace)_ string?
 * @param value Value to check
 * @returns `true` if the value is not `undefined`, `null`, or matches an empty string, otherwise `false`
 */
export function isNonNullableOrEmpty<Value>(
	value: Value,
): value is Exclude<Value, undefined | null | ''> {
	return value != null && getString(value) !== '';
}

/**
 * Is the value not `undefined`, `null`, or stringified as a whitespace-only string?
 * @param value Value to check
 * @returns `true` if the value is not `undefined`, `null`, or matches a whitespace-only string, otherwise `false`
 */
export function isNonNullableOrWhitespace<Value>(
	value: Value,
): value is Exclude<Value, undefined | null | ''> {
	return value != null && !EXPRESSION_WHITESPACE.test(getString(value));
}

/**
 * Is the value not a number or a number-like string?
 * @param value Value to check
 * @returns `true` if the value is not a number or a number-like string, otherwise `false`
 */
export function isNonNumerical<Value>(value: Value): value is Exclude<Value, number | `${number}`> {
	return !isNumerical(value);
}

/**
 * Is the value not an object _(or function)_?
 * @param value Value to check
 * @returns `true` if the value is not an object, otherwise `false`
 */
export function isNonObject<Value>(value: Value): value is Exclude<Value, object> {
	return !isObject(value);
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
 * Is the value `undefined`, `null`, or stringified as an empty _(no whitespace)_ string?
 * @param value Value to check
 * @returns `true` if the value is nullable or matches an empty string, otherwise `false`
 */
export function isNullableOrEmpty(value: unknown): value is undefined | null | '' {
	return value == null || getString(value) === '';
}

/**
 * Is the value `undefined`, `null`, or stringified as a whitespace-only string?
 * @param value Value to check
 * @returns `true` if the value is nullable or matches a whitespace-only string, otherwise `false`
 */
export function isNullableOrWhitespace(value: unknown): value is undefined | null | '' {
	return value == null || EXPRESSION_WHITESPACE.test(getString(value));
}

/**
 * Is the value a number or a number-like string?
 * @param value Value to check
 * @returns `true` if the value is a number or a number-like string, otherwise `false`
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

// #endregion

// #region Variables

const EXPRESSION_WHITESPACE = /^\s*$/;

// #endregion

// #region Exports

export {
	isArrayOrPlainObject,
	isConstructor,
	isInstanceOf,
	isKey,
	isNonArrayOrPlainObject,
	isNonConstructor,
	isNonInstanceOf,
	isNonKey,
	isNonNumber,
	isNonPlainObject,
	isNonPrimitive,
	isNonTypedArray,
	isNumber,
	isPlainObject,
	isPrimitive,
	isTypedArray,
} from './internal/is';

// #endregion
