import type {ArrayOrPlainObject, Key, PlainObject, TypedArray} from '../models';

/**
 * Is the value an array or a record?
 */
export function isArrayOrPlainObject(
	value: unknown,
): value is ArrayOrPlainObject {
	return Array.isArray(value) || isPlainObject(value);
}

/**
 * Is the value a key?
 */
export function isKey(value: unknown): value is Key {
	return typeof value === 'number' || typeof value === 'string';
}

/**
 * Is the value a plain object?
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
 */
export function isTypedArray(value: unknown): value is TypedArray {
	return typeArrays.has((value as TypedArray)?.constructor);
}

const typeArrays = new Set<unknown>([
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
