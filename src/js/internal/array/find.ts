import type {FindType} from '~/array/models';
import {getCallbacks} from '~/internal/array/callbacks';

export function findValue(
	type: FindType,
	array: unknown[],
	bool: unknown,
	key: unknown,
	value: unknown,
): unknown {
	const callbacks = getCallbacks(bool, key);

	if (callbacks?.bool == null && callbacks?.key == null) {
		return type === 'index'
			? array.findIndex(item => item === value)
			: array.find(item => item === value);
	}

	if (callbacks.bool != null) {
		const index = array.findIndex(callbacks.bool);

		return type === 'index' ? index : index > -1 ? array[index] : undefined;
	}

	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		if (callbacks.key?.(item, index, array) === value) {
			return type === 'index' ? index : item;
		}
	}

	return type === 'index' ? -1 : undefined;
}

export function findValues(
	type: 'all' | 'unique',
	array: unknown[],
	bool: unknown,
	key: unknown,
	value: unknown,
): unknown[] {
	const callbacks = getCallbacks(bool, key);
	const {length} = array;

	if (type === 'unique' && callbacks?.key == null && length >= 100) {
		return Array.from(new Set(array));
	}

	if (callbacks?.bool != null) {
		return array.filter(callbacks.bool);
	}

	if (type === 'all' && key == null) {
		return array.filter(item => item === value);
	}

	const result: unknown[] = [];
	const values: unknown[] = callbacks?.key != null ? [] : result;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];
		const keyed = callbacks?.key?.(item, index, array) ?? item;

		if (
			(type === 'all' && keyed === value) ||
			(type === 'unique' && values.indexOf(keyed) === -1)
		) {
			if (values !== result) {
				values.push(keyed);
			}

			result.push(item);
		}
	}

	return result;
}