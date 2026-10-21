import type {GenericCallback} from '../../models';
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

// #region Types

type FindParameters = {
	array: unknown[];
	arrayLength: number;
	callback?: GenericCallback;
	flat: boolean;
	map?: MapCallbacks;
	result: ArrayFindValuesResult;
	type: ArrayFindValuesType;
	value: unknown;
};

type MapCallbacks = {
	after?: GenericCallback;
	before?: GenericCallback;
};

// #endregion

// #region Functions

function addResult(result: ArrayFindValuesResult, mapped: unknown, flat: boolean) {
	if (!flat) {
		result.matched.push(mapped);

		return;
	}

	const array = Array.isArray(mapped) ? mapped : [mapped];

	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		result.matched.push(array[index]);
	}
}

export function createFindParameters(original: unknown[]): ArrayParameters {
	const {length} = original;

	return {
		bool: length === 1 && typeof original[0] === 'function' ? original[0] : undefined,
		key: length === 2 ? original[0] : undefined,
		value: length === 1 && typeof original[0] !== 'function' ? original[0] : original[1],
	};
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

	if (index === -1) {
		return useDefaultValue ? defaultValue : undefined;
	}

	return array[index];
}

function findComplexValues(parameters: FindParameters) {
	const {array, arrayLength, callback, result, type, value} = parameters;

	const keys = new Set();

	for (let arrayIndex = 0; arrayIndex < arrayLength; arrayIndex += 1) {
		const arrayItem = array[arrayIndex];

		const keyed = callback == null ? arrayItem : callback(arrayItem, arrayIndex, array);
		const mapped = arrayItem;

		if (
			(type === ARRAY_FIND_VALUES_ALL && Object.is(keyed, value)) ||
			(type === ARRAY_FIND_VALUES_UNIQUE && !keys.has(keyed))
		) {
			keys.add(keyed);

			result.matched.push(mapped);
		} else {
			result.notMatched.push(arrayItem);
		}
	}

	return result;
}

function findSimpleValue(array: unknown[], value: unknown, findIndex: boolean, reversed: boolean) {
	if (findIndex) {
		return reversed ? array.lastIndexOf(value) : array.indexOf(value);
	}

	return reversed
		? array.findLast(item => Object.is(item, value))
		: array.find(item => Object.is(item, value));
}

function findSimpleValues(parameters: FindParameters) {
	const {array, arrayLength, callback, flat, map, result, value} = parameters;
	const {after, before} = map ?? {};

	const handler = callback ?? (item => Object.is(item, value));

	for (let arrayIndex = 0; arrayIndex < arrayLength; arrayIndex += 1) {
		const arrayItem = array[arrayIndex];

		let mapped = before == null ? arrayItem : before(arrayItem, arrayIndex, array);

		if (!flat || after != null) {
			if (handler(mapped, arrayIndex, array)) {
				mapped = after == null ? mapped : after(arrayItem, arrayIndex, array);

				addResult(result, mapped, flat);
			} else {
				result.notMatched.push(arrayItem);
			}

			continue;
		}

		const flatItems = Array.isArray(mapped) ? mapped : [mapped];
		const flatLength = flatItems.length;

		for (let flatIndex = 0; flatIndex < flatLength; flatIndex += 1) {
			const flatItem = flatItems[flatIndex];

			if (handler(flatItem, arrayIndex, array)) {
				result.matched.push(flatItem);
			} else {
				result.notMatched.push(flatItem);
			}
		}
	}

	return result;
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
		return findSimpleValue(array, value, findIndex, reversed);
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

	if (!Array.isArray(array)) {
		return result;
	}

	const arrayLength = array.length;

	if (arrayLength === 0) {
		return result;
	}

	const {bool, key, value} = createFindParameters(parameters);
	const callbacks = getArrayCallbacks(bool, key);

	if (
		type === ARRAY_FIND_VALUES_UNIQUE &&
		callbacks?.keyed == null &&
		arrayLength >= ARRAY_FIND_UNIQUE_THRESHOLD
	) {
		result.matched = [...new Set(array)];

		return result;
	}

	const flat = mapper?.flat ?? false;
	const mapCallback = getArrayCallback(mapper?.callback);
	const mapReverse = mapper?.reverse ?? false;

	let map: MapCallbacks | undefined;

	if (mapCallback != null) {
		map = {
			before: mapReverse ? mapCallback : undefined,
			after: mapReverse ? undefined : mapCallback,
		};
	}

	const findParameters = {
		array,
		arrayLength,
		flat,
		map,
		result,
		type,
		value,
	} as FindParameters;

	if (callbacks?.bool != null || (type === ARRAY_FIND_VALUES_ALL && key == null)) {
		findParameters.callback = callbacks?.bool;

		return findSimpleValues(findParameters);
	}

	findParameters.callback = callbacks?.keyed;

	return findComplexValues(findParameters);
}

// #endregion
