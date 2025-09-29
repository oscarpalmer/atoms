import type {ArrayOrPlainObject, Key, PlainObject, TypedArray} from '../models';

/**
 * Is the value an array or a record?
 * @param value Value to check
 * @returns `true` if the value is an array or a record, otherwise `false`
 */
export function isArrayOrPlainObject(
	value: unknown,
): value is ArrayOrPlainObject {
	return Array.isArray(value) || isPlainObject(value);
}

/**
 * Is the value a key?
 * @param value Value to check
 * @returns `true` if the value is a `Key` _(`number` or `string`)_, otherwise `false`
 */
export function isKey(value: unknown): value is Key {
	return typeof value === 'number' || typeof value === 'string';
}

/**
 * Is the value a number?
 * @param value Value to check
 * @returns `true` if the value is a `number`, otherwise `false`
 */
export function isNumber(value: unknown): value is number {
	return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Is the value a plain object?
 * @param value Value to check
 * @returns `true` if the value is a plain object, otherwise `false`
 */
export function isPlainObject(value: unknown): value is PlainObject {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	if (Symbol.toStringTag in value || Symbol.iterator in value) {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);

	return (
		prototype === null ||
		prototype === Object.prototype ||
		Object.getPrototypeOf(prototype) === null
	);
}

/**
 * Is the value a typed array?
 * @param value Value to check
 * @returns `true` if the value is a typed array, otherwise `false`
 */
export function isTypedArray(value: unknown): value is TypedArray {
	return TYPED_ARRAYS.has((value as TypedArray)?.constructor);
}

//

const TYPED_ARRAYS: Set<unknown> = new Set([
	Int8Array,
	Uint8Array,
	Uint8ClampedArray,
	Int16Array,
	Uint16Array,
	Int32Array,
	Uint32Array,
	Float32Array,
	Float64Array,
	BigInt64Array,
	BigUint64Array,
]);
