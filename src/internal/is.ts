import type {
	ArrayOrPlainObject,
	Constructor,
	Key,
	PlainObject,
	Primitive,
	TypedArray,
} from '../models';

// #region Functions

/**
 * Is the value an array or a record?
 * @param value Value to check
 * @returns `true` if the value is an array or a record, otherwise `false`
 */
export function isArrayOrPlainObject(value: unknown): value is ArrayOrPlainObject {
	return Array.isArray(value) || isPlainObject(value);
}

/**
 * Is the value a constructor function?
 * @param value Value to check
 * @returns `true` if the value is a constructor function, otherwise `false`
 */
export function isConstructor(value: unknown): value is Constructor {
	return typeof value === 'function' && value.prototype?.constructor === value;
}

/**
 * Is the value an instance of the constructor?
 * @param constructor Class constructor
 * @param value Value to check
 * @returns `true` if the value is an instance of the constructor, otherwise `false`
 */
export function isInstanceOf<Instance>(
	constructor: Constructor<Instance>,
	value: unknown,
): value is Instance {
	return isConstructor(constructor) && value instanceof constructor;
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
 * Is the value not an array or a plain object?
 * @param value Value to check
 * @returns `true` if the value is not an array or a plain object, otherwise `false`
 */
export function isNonArrayOrPlainObject<Value>(
	value: Value,
): value is Exclude<Value, ArrayOrPlainObject> {
	return !isArrayOrPlainObject(value);
}

/**
 * Is the value not a constructor function?
 * @param value Value to check
 * @returns `true` if the value is not a constructor function, otherwise `false`
 */
export function isNonConstructor<Value>(value: Value): value is Exclude<Value, Constructor> {
	return !isConstructor(value);
}

/**
 * Is the value not an instance of the constructor?
 * @param constructor Class constructor
 * @param value Value to check
 * @returns `true` if the value is not an instance of the constructor, otherwise `false`
 */
export function isNonInstanceOf<Instance, Value>(
	constructor: Constructor<Instance>,
	value: Value,
): value is Exclude<Value, Instance> {
	return !isInstanceOf(constructor, value);
}

/**
 * Is the value not a key?
 * @param value Value to check
 * @returns `true` if the value is not a `Key` _(`number` or `string`)_, otherwise `false`
 */
export function isNonKey<Value>(value: Value): value is Exclude<Value, Key> {
	return !isKey(value);
}

/**
 * Is the value not a number?
 * @param value Value to check
 * @returns `true` if the value is not a `number`, otherwise `false`
 */
export function isNonNumber<Value>(value: Value): value is Exclude<Value, number> {
	return !isNumber(value);
}

/**
 * Is the value not a plain object?
 * @param value Value to check
 * @returns `true` if the value is not a plain object, otherwise `false`
 */
export function isNonPlainObject<Value>(value: Value): value is Exclude<Value, PlainObject> {
	return !isPlainObject(value);
}

/**
 * Is the value not a primitive value?
 * @param value Value to check
 * @returns `true` if the value is not a primitive value, otherwise `false`
 */
export function isNonPrimitive<Value>(value: Value): value is Exclude<Value, Primitive> {
	return !isPrimitive(value);
}

/**
 * Is the value not a template strings array?
 * @param value Value to check
 * @returns `true` if the value is not a `TemplateStringsArray`, otherwise `false`
 */
export function isNonTemplateStringsArray<Value>(
	value: Value,
): value is Exclude<Value, TemplateStringsArray> {
	return !isTemplateStringsArray(value);
}

/**
 * Is the value not a typed array?
 * @param value Value to check
 * @returns `true` if the value is not a typed array, otherwise `false`
 */
export function isNonTypedArray<Value>(value: Value): value is Exclude<Value, TypedArray> {
	return !isTypedArray(value);
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
 * - Is the value a primitive value?
 * @param value Value to check
 * @returns `true` if the value matches, otherwise `false`
 */
export function isPrimitive(value: unknown): value is Primitive {
	if (value == null) {
		return true;
	}

	const type = typeof value;

	return (
		type === 'bigint' ||
		type === 'boolean' ||
		type === 'number' ||
		type === 'string' ||
		type === 'symbol'
	);
}

/**
 * Is the value a template strings array?
 * @param value Value to check
 * @returns `true` if the value is a `TemplateStringsArray`, otherwise `false`
 */
export function isTemplateStringsArray(value: unknown): value is TemplateStringsArray {
	return Array.isArray(value) && Array.isArray((value as unknown as TemplateStringsArray).raw);
}

/**
 * Is the value a typed array?
 * @param value Value to check
 * @returns `true` if the value is a typed array, otherwise `false`
 */
export function isTypedArray(value: unknown): value is TypedArray {
	(isTypedArray as any).types ??= new Set<unknown>([
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

	return (isTypedArray as any).types.has((value as TypedArray)?.constructor);
}

// #endregion
