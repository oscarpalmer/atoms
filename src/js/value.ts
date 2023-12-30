import {getString, isNullableOrWhitespace} from './string';

export type ArrayOrObject = unknown[] | GenericObject;
export type GenericObject = Record<string, unknown>;
export type Key = number | string;
export type ValueObject = ArrayOrObject | Map<unknown, unknown> | Set<unknown>;

const badProperties = new Set(['__proto__', 'constructor', 'prototype']);
const objectConstructor = 'Object';
const constructors = new Set(['Array', objectConstructor]);
const numberExpression = /^\d+$/;

/**
 * Internal function to get a value from an object
 */
function _getValue(data: ValueObject, key: string): unknown {
	if (typeof data !== 'object' || data === null || badProperties.has(key)) {
		return undefined;
	}

	if (data instanceof Map) {
		return data.get(key as never);
	}

	if (data instanceof Set) {
		return Array.from(data)[key as never];
	}

	return data[key as never];
}

/**
 * Internal function to set a value in an object
 */
function _setValue(data: ValueObject, key: string, value: unknown): void {
	if (typeof data !== 'object' || data === null || badProperties.has(key)) {
		return;
	}

	if (data instanceof Map) {
		data.set(key as never, value);
	} else if (data instanceof Set) {
		_setValueInSet(data, key, value);
	} else {
		data[key as never] = value as never;
	}
}

/**
 * - Internal function to set a value in a `Set`
 * - If key is not a valid index or if it is greater than or equal to the length of the set, we simply append it to the set
 * - If the index is less than the size of the set, we convert the set to an array, splice the value into the array, and then convert the array back to a set
 */
function _setValueInSet(data: Set<unknown>, key: string, value: unknown): void {
	const index = numberExpression.test(key) ? Number.parseInt(key, 10) : -1;

	if (index === -1 || index >= data.size) {
		data.add(value);

		return;
	}

	const array = Array.from(data);

	array.splice(index, 1, value);

	data.clear();

	const {length} = array;

	let position = Number(length);

	while (position--) {
		data.add(array[length - position - 1]);
	}
}

/**
 * - Get the value from an object using a key path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - Returns `undefined` if the value is not found
 */
export function getValue(data: ValueObject, key: Key): unknown {
	if (
		typeof data !== 'object' ||
		data === null ||
		isNullableOrWhitespace(key)
	) {
		return undefined;
	}

	const parts = getString(key).split('.').reverse();

	let position = parts.length;
	let value = data;

	while (position--) {
		value = _getValue(value, parts[position]) as ValueObject;

		if (value === undefined) {
			break;
		}
	}

	return value;
}

/**
 * Is the value an array or a generic object?
 */
export function isArrayOrObject(value: unknown): value is ArrayOrObject {
	return constructors.has((value as ArrayOrObject)?.constructor?.name);
}

/**
 * Is the value undefined or null?
 */
export function isNullable(value: unknown): value is undefined | null {
	return value === undefined || value === null;
}

/**
 * Is the value a generic object?
 */
export function isObject(value: unknown): value is GenericObject {
	return (value as GenericObject)?.constructor?.name === objectConstructor;
}

/**
 * - Set the value in an object using a key path
 * - You can set a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If a part of the path does not exist, it will be created, either as an array or a generic object, depending on the key
 * - Returns the original object
 */
export function setValue<Model extends ValueObject>(
	data: Model,
	key: Key,
	value: unknown,
): Model {
	if (
		typeof data !== 'object' ||
		data === null ||
		isNullableOrWhitespace(key)
	) {
		return data;
	}

	const parts = getString(key).split('.').reverse();

	let position = parts.length;
	let target: ValueObject = data;

	while (position--) {
		const key = parts[position] as never;

		if (position === 0) {
			_setValue(target, key, value);

			break;
		}

		let next = _getValue(target, key);

		if (typeof next !== 'object' || next === null) {
			next = numberExpression.test(parts[position - 1]) ? [] : {};

			target[key] = next as never;
		}

		target = next as ValueObject;
	}

	return data;
}
