import {isNumber} from './internal/is';
import {getString} from './internal/string';
import type {ArrayOrPlainObject, Primitive} from './models';

/**
 * Is the array or object completely empty, or only containing `null` or `undefined` values?
 * @param value Array or object to check
 * @returns `true` if the value is considered empty, `false` otherwise
 */
export function isEmpty(value: ArrayOrPlainObject): boolean {
	const values = Object.values(value);
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
 * @returns `true` if the value is `undefined` or `null`, `false` otherwise
 */
export function isNullable(value: unknown): value is undefined | null {
	return value == null;
}

/**
 * Is the value `undefined`, `null`, or an empty _(no whitespace)_ string?
 * @param value Value to check
 * @returns `true` if the value is nullable or an empty string, `false` otherwise
 */
export function isNullableOrEmpty(
	value: unknown,
): value is undefined | null | '' {
	return value == null || getString(value) === '';
}

/**
 * Is the value `undefined`, `null`, or a whitespace-only string?
 * @param value Value to check
 * @returns `true` if the value is nullable or a whitespace-only string, `false` otherwise
 */
export function isNullableOrWhitespace(
	value: unknown,
): value is undefined | null | '' {
	return value == null || whiteSpaceExpression.test(getString(value));
}

/**
 * Is the value a number or a number-like string?
 * @param value Value to check
 * @returns `true` if the value is a number or a parseable string, `false` otherwise
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
 * Is the value an object _(or function)_?
 * @param value Value to check
 * @returns `true` if the value matches, `false` otherwise
 */
export function isObject(value: unknown): value is object {
	return (
		(typeof value === 'object' && value !== null) || typeof value === 'function'
	);
}

/**
 * - Is the value a primitive value?
 * @param value Value to check
 * @returns `true` if the value matches, `false` otherwise
 */
export function isPrimitive(value: unknown): value is Primitive {
	return value == null || primitiveExpression.test(typeof value);
}

export * from './internal/is';
export type {
	ArrayOrPlainObject,
	Key,
	PlainObject,
	Primitive,
	TypedArray,
} from './models';

//

const primitiveExpression = /^(bigint|boolean|number|string|symbol)$/;

const whiteSpaceExpression = /^\s*$/;
