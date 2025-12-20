import {getArrayCallbacks} from './callbacks';

type FindValueType = 'index' | 'value';

type FindValuesType = 'all' | 'unique';

type Parameters = {
	bool?: unknown;
	key?: unknown;
	value?: unknown;
};

//

export function findValue(type: FindValueType, array: unknown[], parameters: unknown[]): unknown {
	const findIndex = type === 'index';

	if (!Array.isArray(array) || array.length === 0) {
		return findIndex ? -1 : undefined;
	}

	const {bool, key, value} = getParameters(parameters);

	const callbacks = getArrayCallbacks(bool, key);

	if (callbacks?.bool == null && callbacks?.keyed == null) {
		return findIndex ? array.indexOf(value) : array.find(item => item === value);
	}

	if (callbacks.bool != null) {
		const index = array.findIndex(callbacks.bool);

		return findIndex ? index : array[index];
	}

	return findValueInArray(array, callbacks.keyed, value, findIndex);
}

function findValueInArray(
	array: unknown[],
	callback: ((item: unknown, index: number, array: unknown[]) => boolean) | undefined,
	value: unknown,
	findIndex: boolean,
): unknown {
	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		if (callback?.(item, index, array) === value) {
			return findIndex ? index : item;
		}
	}

	return findIndex ? -1 : undefined;
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
): unknown[] | undefined;

export function findValues(
	type: FindValuesType,
	array: unknown[],
	parameters: unknown[],
): unknown[] | undefined {
	if (!Array.isArray(array)) {
		return [];
	}

	if (array.length === 0) {
		return [];
	}

	const {length} = array;
	const {bool, key, value} = getParameters(parameters);
	const callbacks = getArrayCallbacks(bool, key);

	if (type === 'unique' && callbacks?.keyed == null && length >= UNIQUE_THRESHOLD) {
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

		if ((type === 'all' && Object.is(keyed, value)) || (type === 'unique' && !keys.has(keyed))) {
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
		bool: length === 1 && typeof original[0] === 'function' ? original[0] : undefined,
		key: length === 2 ? original[0] : undefined,
		value: length === 1 && typeof original[0] !== 'function' ? original[0] : original[1],
	};
}

//

const UNIQUE_THRESHOLD = 100;
