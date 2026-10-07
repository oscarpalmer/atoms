import {
	ARRAY_FIND_UNIQUE_THRESHOLD,
	ARRAY_FIND_VALUE_INDEX,
	ARRAY_FIND_VALUES_ALL,
	ARRAY_FIND_VALUES_UNIQUE,
	type ArrayFindMapper,
	type ArrayFindValuesResult,
	type ArrayFindValuesType,
	type ArrayFindValueType,
	type ArrayParameters,
} from '../../models/array/array.find.model';
import {getArrayCallback, getArrayCallbacks} from './callbacks';

// #region Functions

export function createFindParameters(original: unknown[]): ArrayParameters {
	const {length} = original;

	return {
		bool: length === 1 && typeof original[0] === 'function' ? original[0] : undefined,
		key: length === 2 ? original[0] : undefined,
		value: length === 1 && typeof original[0] !== 'function' ? original[0] : original[1],
	};
}

export function findValue(
	type: Exclude<ArrayFindValueType, 'item'>,
	array: unknown[],
	parameters: unknown[],
	reversed: boolean,
): number;

export function findValue(
	type: Exclude<ArrayFindValueType, 'index'>,
	array: unknown[],
	parameters: unknown[],
	reversed: boolean,
): unknown;

export function findValue(
	type: ArrayFindValueType,
	array: unknown[],
	parameters: unknown[],
	reversed: boolean,
): unknown {
	const findIndex = type === ARRAY_FIND_VALUE_INDEX;

	if (!Array.isArray(array) || array.length === 0) {
		return findIndex ? -1 : undefined;
	}

	const {bool, key, value} = createFindParameters(parameters);

	const callbacks = getArrayCallbacks(bool, key);

	if (callbacks?.bool == null && callbacks?.keyed == null) {
		if (findIndex) {
			return reversed ? array.lastIndexOf(value) : array.indexOf(value);
		}

		return reversed
			? array.findLast(item => Object.is(item, value))
			: array.find(item => Object.is(item, value));
	}

	if (callbacks.bool != null) {
		const index = reversed ? array.findLastIndex(callbacks.bool) : array.findIndex(callbacks.bool);

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

	const index = findValue(ARRAY_FIND_VALUE_INDEX, array, parameters, reversed) as number;

	return index > -1 ? array[index] : useDefaultValue ? defaultValue : undefined;
}

export function findValues(
	type: ArrayFindValuesType,
	array: unknown[],
	parameters: unknown[],
	mapper?: ArrayFindMapper,
): ArrayFindValuesResult {
	const result: ArrayFindValuesResult = {
		matched: [],
		notMatched: [],
	};

	if (!Array.isArray(array) || array.length === 0) {
		return result;
	}

	const {length} = array;
	const {bool, key, value} = createFindParameters(parameters);
	const callbacks = getArrayCallbacks(bool, key);

	if (
		type === ARRAY_FIND_VALUES_UNIQUE &&
		callbacks?.keyed == null &&
		length >= ARRAY_FIND_UNIQUE_THRESHOLD
	) {
		result.matched = [...new Set(array)];

		return result;
	}

	const mapCallback = getArrayCallback(mapper?.callback);
	const mapReverse = mapper?.reverse ?? false;

	const mapAfter = mapCallback == null ? undefined : mapReverse ? undefined : mapCallback;
	const mapBefore = mapCallback == null ? undefined : mapReverse ? mapCallback : undefined;

	if (callbacks?.bool != null || (type === ARRAY_FIND_VALUES_ALL && key == null)) {
		const callback = callbacks?.bool ?? (item => Object.is(item, value));

		for (let index = 0; index < length; index += 1) {
			const item = array[index];
			const transformed = mapBefore?.(item, index, array) ?? item;

			if (callback(transformed, index, array)) {
				result.matched.push(mapAfter?.(item, index, array) ?? transformed);
			} else {
				result.notMatched.push(item);
			}
		}

		return result;
	}

	const keys = new Set();

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		let keyed: unknown;
		let transformed: unknown;

		if (mapBefore == null) {
			keyed = callbacks?.keyed?.(item, index, array) ?? item;
			transformed = item;
		} else {
			transformed = mapBefore(item, index, array);
			keyed = callbacks?.keyed?.(transformed, index, array) ?? transformed;
		}

		if (
			(type === ARRAY_FIND_VALUES_ALL && Object.is(keyed, value)) ||
			(type === ARRAY_FIND_VALUES_UNIQUE && !keys.has(keyed))
		) {
			keys.add(keyed);
			result.matched.push(mapAfter?.(item, index, array) ?? transformed);
		} else {
			result.notMatched.push(item);
		}
	}

	return result;
}

// #endregion
