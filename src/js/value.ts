import {getString, isNullableOrWhitespace} from './string';

/**
 * - Get the value from an object using a path
 * - You can retrieve a nested value by using a dot notation path
 */
export function getValue(data: unknown, key: unknown): unknown {
	if (
		typeof data !== 'object' ||
		data === null ||
		isNullableOrWhitespace(key)
	) {
		return undefined;
	}

	const parts = getString(key).split('.');
	const length = parts.length;

	let index = 0;
	let value = data;

	while (typeof value === 'object' && value !== null && index < length) {
		value = value[parts[index++]];
	}

	return value;
}

/**
 * Is the value undefined or null?
 */
export function isNullable(value: unknown): value is undefined | null {
	return value === undefined || value === null;
}
