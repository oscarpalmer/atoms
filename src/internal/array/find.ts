import {getArrayCallback, getArrayCallbacks} from './callbacks';

// #region Types

type FindValueType = 'index' | 'item';

type FindValuesResult = {
	matched: unknown[];
	notMatched: unknown[];
};

type FindValuesType = 'all' | 'unique';

type Parameters = {
	bool?: unknown;
	key?: unknown;
	value?: unknown;
};

// #endregion

// #region Functions

export function findValue(
	type: FindValueType,
	array: unknown[],
	parameters: unknown[],
	reversed: boolean,
): unknown {
	const findIndex = type === FIND_VALUE_INDEX;

	if (!Array.isArray(array) || array.length === 0) {
		return findIndex ? -1 : undefined;
	}

	const {bool, key, value} = getFindParameters(parameters);

	const callbacks = getArrayCallbacks(bool, key);

	if (callbacks?.bool == null && callbacks?.keyed == null) {
		return findIndex ? array.indexOf(value) : array.find(item => Object.is(item, value));
	}

	if (callbacks.bool != null) {
		const index = array.findIndex(callbacks.bool);

		return findIndex ? index : array[index];
	}

	return findValueInArray(array, callbacks.keyed, value, findIndex, reversed);
}

function findValueInArray(
	array: unknown[],
	callback: ((item: unknown, index: number, array: unknown[]) => boolean) | undefined,
	value: unknown,
	findIndex: boolean,
	reversed: boolean,
): unknown {
	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const item = reversed ? array.at(-(index + 1)) : array[index];

		if (Object.is(callback?.(item, index, array), value)) {
			return findIndex ? index : item;
		}
	}

	return findIndex ? -1 : undefined;
}

export function findAbsoluteValueOrDefault(
	array: unknown[],
	parameters: unknown[],
	defaultValue: unknown,
	useDefaultValue: boolean,
	reversed: boolean,
): unknown {
	if (parameters.length === 0) {
		if (Array.isArray(array) && array.length > 0) {
			return reversed ? array.at(-1) : array[0];
		}

		return useDefaultValue ? defaultValue : undefined;
	}

	const index = findValue(FIND_VALUE_INDEX, array, parameters, reversed) as number;

	return index > -1 ? array[index] : useDefaultValue ? defaultValue : undefined;
}

export function findValues(
	type: FindValuesType,
	array: unknown[],
	parameters: unknown[],
	mapper?: unknown,
): FindValuesResult {
	const result: FindValuesResult = {
		matched: [],
		notMatched: [],
	};

	if (!Array.isArray(array) || array.length === 0) {
		return result;
	}

	const {length} = array;
	const {bool, key, value} = getFindParameters(parameters);
	const callbacks = getArrayCallbacks(bool, key);

	if (type === FIND_VALUES_UNIQUE && callbacks?.keyed == null && length >= UNIQUE_THRESHOLD) {
		result.matched = [...new Set(array)];

		return result;
	}

	const mapCallback = getArrayCallback(mapper);

	if (callbacks?.bool != null || (type === FIND_VALUES_ALL && key == null)) {
		const callback = callbacks?.bool ?? (item => Object.is(item, value));

		for (let index = 0; index < length; index += 1) {
			const item = array[index];

			if (callback(item, index, array)) {
				result.matched.push(mapCallback?.(item, index, array) ?? item);
			} else {
				result.notMatched.push(item);
			}
		}

		return result;
	}

	const keys = new Set();

	for (let index = 0; index < length; index += 1) {
		const item = array[index];
		const keyed = callbacks?.keyed?.(item, index, array) ?? item;

		if (
			(type === FIND_VALUES_ALL && Object.is(keyed, value)) ||
			(type === FIND_VALUES_UNIQUE && !keys.has(keyed))
		) {
			keys.add(keyed);
			result.matched.push(mapCallback?.(item, index, array) ?? item);
		} else {
			result.notMatched.push(item);
		}
	}

	return result;
}

export function getFindParameters(original: unknown[]): Parameters {
	const {length} = original;

	return {
		bool: length === 1 && typeof original[0] === 'function' ? original[0] : undefined,
		key: length === 2 ? original[0] : undefined,
		value: length === 1 && typeof original[0] !== 'function' ? original[0] : original[1],
	};
}

// #endregion

// #region Variables

export const FIND_VALUE_INDEX: FindValueType = 'index';

export const FIND_VALUE_ITEM: FindValueType = 'item';

export const FIND_VALUES_ALL: FindValuesType = 'all';

export const FIND_VALUES_UNIQUE: FindValuesType = 'unique';

const UNIQUE_THRESHOLD = 100;

// #endregion
