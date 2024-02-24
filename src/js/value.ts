import {getString, isNullableOrWhitespace} from './string';

export type ArrayOrObject = unknown[] | GenericObject;
export type GenericObject = Record<string, unknown>;
export type Key = number | string;
export type ValueObject = ArrayOrObject | Map<unknown, unknown> | Set<unknown>;

/**
 * Internal function to get a value from an object
 */
function _getValue(data: ValueObject, key: string): unknown {
	if (
		typeof data !== 'object' ||
		data === null ||
		/^(__proto__|constructor|prototype)$/i.test(key)
	) {
		return;
	}

	return data instanceof Map ? data.get(key as never) : data[key as never];
}

/**
 * Internal function to set a value in an object
 */
function _setValue(data: ValueObject, key: string, value: unknown): void {
	if (
		typeof data !== 'object' ||
		data === null ||
		/^(__proto__|constructor|prototype)$/i.test(key)
	) {
		return;
	}

	if (data instanceof Map) {
		data.set(key as never, value);
	} else {
		data[key as never] = value as never;
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
		return;
	}

	const parts = getString(key).split('.');

	const {length} = parts;

	let index = 0;
	let value = data;

	for (; index < length; index += 1) {
		value = _getValue(value, parts[index]) as ValueObject;

		if (value == null) {
			break;
		}
	}

	return value;
}

/**
 * Is the value an array or a generic object?
 */
export function isArrayOrObject(value: unknown): value is ArrayOrObject {
	return /^(array|object)$/i.test((value as ArrayOrObject)?.constructor?.name);
}

/**
 * Is the value undefined or null?
 */
export function isNullable(value: unknown): value is undefined | null {
	return value == null;
}

/**
 * Is the value a generic object?
 */
export function isObject(value: unknown): value is GenericObject {
	return /^object$/i.test((value as GenericObject)?.constructor?.name);
}

/**
 * - Set the value in an object using a key path
 * - You can set a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If a part of the path does not exist, it will be created, either as an array or a generic object, depending on the key
 * - Returns the original object
 */
export function setValue<T extends ValueObject>(
	data: T,
	key: Key,
	value: unknown,
): T {
	if (
		typeof data !== 'object' ||
		data === null ||
		isNullableOrWhitespace(key)
	) {
		return data;
	}

	const parts = getString(key).split('.');

	const {length} = parts;

	let index = 0;
	let target: ValueObject = data;

	for (; index < length; index += 1) {
		const part = parts[index];

		if (parts.indexOf(part) === parts.length - 1) {
			_setValue(target, part, value);

			break;
		}

		let next = _getValue(target, part);

		if (typeof next !== 'object' || next === null) {
			next = /^\d+$/.test(part) ? [] : {};

			target[part as never] = next as never;
		}

		target = next as ValueObject;
	}

	return data;
}
