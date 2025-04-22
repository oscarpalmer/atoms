import type {FindValueType, FindValuesType} from '../../array/models';
import {getCallbacks} from './callbacks';

type Parameters = {
	bool?: unknown;
	key?: unknown;
	value?: unknown;
};

export function findValue(
	type: FindValueType,
	array: unknown[],
	parameters: unknown[],
): unknown {
	if (!Array.isArray(array) || array.length === 0) {
		return type === 'index' ? -1 : undefined;
	}

	const {bool, key, value} = getParameters(parameters);

	const callbacks = getCallbacks(bool, key);

	if (callbacks?.bool == null && callbacks?.keyed == null) {
		return type === 'index'
			? array.indexOf(value)
			: array.find(item => item === value);
	}

	if (callbacks.bool != null) {
		const index = array.findIndex(callbacks.bool);

		return type === 'index' ? index : array[index];
	}

	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		if (callbacks.keyed?.(item, index, array) === value) {
			return type === 'index' ? index : item;
		}
	}

	return type === 'index' ? -1 : undefined;
}

export function findValues(
	type: FindValuesType,
	array: unknown[],
	parameters: unknown[],
): unknown[];

export function findValues(
	type: FindValuesType,
	array: unknown[],
	parameters: unknown[],
	count: boolean,
): unknown[] | undefined;

export function findValues(
	type: FindValuesType,
	array: unknown[],
	parameters: unknown[],
	count?: boolean,
): unknown[] | undefined {
	if (!Array.isArray(array)) {
		return count ? undefined : [];
	}

	if (array.length === 0) {
		return [];
	}

	const {bool, key, value} = getParameters(parameters);
	const callbacks = getCallbacks(bool, key);
	const {length} = array;

	if (type === 'unique' && callbacks?.keyed == null && length >= 100) {
		return [...new Set(array)];
	}

	if (callbacks?.bool != null) {
		return array.filter(callbacks.bool);
	}

	if (type === 'all' && key == null) {
		return array.filter(item => item === value);
	}

	const keys = new Set();
	const result: unknown[] = [];

	for (let index = 0; index < length; index += 1) {
		const item = array[index];
		const keyed = callbacks?.keyed?.(item, index, array) ?? item;

		if (
			(type === 'all' && Object.is(keyed, value)) ||
			(type === 'unique' && !keys.has(keyed))
		) {
			keys.add(keyed);
			result.push(item);
		}
	}

	keys.clear();

	return result;
}

function getParameters(original: unknown[]): Parameters {
	const {length} = original;

	return {
		bool:
			length === 1 && typeof original[0] === 'function'
				? original[0]
				: undefined,
		key: length === 2 ? original[0] : undefined,
		value:
			length === 1 && typeof original[0] !== 'function'
				? original[0]
				: original[1],
	};
}
