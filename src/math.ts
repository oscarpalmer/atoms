import {isNumber} from './internal/is';
import {aggregate, getAggregateCallback, getAggregated} from './internal/math/aggregate';
import {floor, roundNumber} from './internal/math/misc';
import type {NumericalValues, PlainObject} from './models/index';
import {AGGREGATION_AVERAGE, AGGREGATION_SUM} from './models/math.model';

// #region Functions

/**
 * Get the average value from a list of items
 *
 * @param items List of items
 * @param callback Callback to get an item's value
 * @returns Average value, or `Number.NaN` if no average can be calculated
 *
 * @example
 * ```typescript
 * average([
 *   {value: 1},
 *   {value: 2},
 *   {value: 3},
 * ], item => item.value); // => 2
 * average([{value: 1}], item => item.nope); // => Number.NaN
 * ```
 */
export function average<Item>(
	items: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): number;

/**
 * Get the average value from a list of items
 *
 * @param items List of items
 * @param key Key to use for value
 * @returns Average value, or `Number.NaN` if no average can be calculated
 *
 * @example
 * ```typescript
 * average([{value: 1}, {value: 2}, {value: 3}], 'value'); // => 2
 * average([{value: 1}], 'nope'); // => Number.NaN
 * ```
 */
export function average<Item extends PlainObject>(
	items: Item[],
	key: keyof NumericalValues<Item>,
): number;

/**
 * Get the average value from a list of numbers
 *
 * @param numbers List of numbers
 * @returns Average value, or `Number.NaN` if no average can be calculated
 *
 * @example
 * ```typescript
 * average([1, 2, 3, 4, 5]); // => 3
 * average([]); // => Number.NaN
 * ```
 */
export function average(numbers: number[]): number;

export function average(array: unknown[], key?: unknown): number {
	const aggregated = aggregate(AGGREGATION_AVERAGE, array, key);

	return aggregated.count > 0 ? aggregated.value / aggregated.count : Number.NaN;
}

/**
 * Round a number up
 *
 * @param value Number to round up
 * @param decimals Number of decimal places to round to _(defaults to `0`)_
 * @returns Rounded number, or `Number.NaN` if the value if unable to be rounded
 *
 * @example
 * ```typescript
 * ceil(1.234, 2); // => 1.24
 * ceil(1.234);    // => 2
 * ceil('abc');    // => Number.NaN
 * ```
 */
export function ceil(value: number, decimals?: number): number {
	return roundNumber(Math.ceil, value, decimals);
}

/**
 * Count the number of items in an array that match a specific value
 *
 * @param array Array to count for
 * @param callback Callback to get an item's value
 * @param value Value to match and count
 * @returns Number of items that match the condition, or `Number.NaN` if no count can be calculated
 *
 * @example
 * ```typescript
 * count([1, 2, 3, 2], (item) => item, 2); // => 2
 * count([{value: 1}, {value: 2}, {value: 3}], 'value', 2); // => 1
 * count([1, 2, 3], (item) => item, 4); // => 0
 * count([], (item) => item, 1); // => Number.NaN
 * ```
 */
export function count<Item>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
	value: unknown,
): number;

/**
 * Count the number of items in an array that have a specific value
 *
 * @param array Array to count for
 * @param key Key to use for value
 * @param value Value to match and count
 * @returns Number of items with the specified key value, or `Number.NaN` if no count can be calculated
 *
 * @example
 * ```typescript
 * count([{value: 1}, {value: 2}, {value: 3}], 'value', 2); // => 1
 * count([{value: 1}], 'nope', 1); // => Number.NaN
 * ```
 */
export function count<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): number;

/**
 * Count the number of items in an array
 *
 * @param values Array to count for
 * @returns Number of items, or `Number.NaN` if no count can be calculated
 *
 * @example
 * ```typescript
 * count([1, 2, 3]); // => 3
 * count([]);        // => Number.NaN
 * ```
 */
export function count(values: unknown[]): number;

export function count(array: unknown[], key?: unknown, value?: unknown): number {
	if (!Array.isArray(array)) {
		return Number.NaN;
	}

	const {length} = array;

	const callback = getAggregateCallback(key);

	if (callback == null) {
		return length;
	}

	let counted = 0;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		if (Object.is(callback(item, index, array), value)) {
			counted += 1;
		}
	}

	return counted;
}

/**
 * Get the median value from a list of items
 *
 * @param array List of items
 * @param callback Callback to get an item's value
 * @returns Median value, or `Number.NaN` if no median can be calculated
 *
 * @example
 * ```typescript
 * median([1, 2, 3, 4, 5]); // => 3
 * median([1, 2, 3, 4]);    // => 2.5
 * median([]);              // => Number.NaN
 * ```
 */
export function median<Item>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): number;

/**
 * Get the median value from a list of items
 *
 * @param array List of items
 * @param key Key to use for value
 * @returns Median value, or `Number.NaN` if no median can be calculated
 *
 * @example
 * ```typescript
 * median([{value: 1}, {value: 2}, {value: 3}], 'value'); // => 2
 * median([{value: 1}, {value: 2}, {value: 3}, {value: 4}], 'value'); // => 2.5
 * median([], 'value'); // => Number.NaN
 * ```
 */
export function median<Item extends PlainObject>(
	array: Item[],
	key: keyof NumericalValues<Item>,
): number;

/**
 * Get the median value from a list of numbers
 *
 * @param array List of numbers
 * @returns Median value, or `Number.NaN` if no median can be calculated
 *
 * @example
 * ```typescript
 * median([1, 2, 3, 4, 5]); // => 3
 * median([1, 2, 3, 4]);    // => 2.5
 * median([]);              // => Number.NaN
 * ```
 */
export function median(array: number[]): number;

export function median(array: unknown[], key?: unknown): number {
	let length = Array.isArray(array) ? array.length : 0;

	if (!Array.isArray(array) || length === 0) {
		return Number.NaN;
	}

	let values: unknown[] = array;

	const callback = getAggregateCallback(key);

	if (callback != null) {
		values = array.map((item, index) => callback(item, index, array));
	}

	const numbers = values.filter(isNumber).sort((first, second) => first - second);

	length = numbers.length;

	if (length === 1) {
		return numbers[0];
	}

	if (length % 2 === 0) {
		const first = length / 2 - 1;
		const second = length / 2;

		return (numbers[first] + numbers[second]) / 2;
	}

	return numbers[floor(length / 2)];
}

/**
 * Get the sum of a list of items
 *
 * @param items List of items
 * @param callback Callback to get an item's value
 * @returns Sum of the values, or `Number.NaN` if no sum can be calculated
 *
 * @example
 * ```typescript
 * sum([{value: 1}, {value: 2}, {value: 3}], 'value'); // => 6
 * sum([{value: 1}, {value: 2}, {value: 3}], item => item.value); // => 6
 * sum([]); // => Number.NaN
 * ```
 */
export function sum<Item>(
	items: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): number;

/**
 * Get the sum of a list of items
 *
 * @param items List of items
 * @param key Key to use for value
 * @returns Sum of the values, or `Number.NaN` if no sum can be calculated
 *
 * @example
 * ```typescript
 * sum([{value: 1}, {value: 2}, {value: 3}], 'value'); // => 6
 * sum([{value: 1}, {value: 2}, {value: 3}], item => item.value); // => 6
 * sum([]); // => Number.NaN
 * ```
 */
export function sum<Item extends PlainObject>(
	items: Item[],
	key: keyof NumericalValues<Item>,
): number;

/**
 * Get the sum of a list of numbers
 *
 * @param values List of numbers
 * @returns Sum of the numbers, or `Number.NaN` if no sum can be calculated
 *
 * @example
 * ```typescript
 * sum([1, 2, 3]); // => 6
 * sum([]);        // => Number.NaN
 * ```
 */
export function sum(values: number[]): number;

export function sum(array: unknown[], key?: unknown): unknown {
	return getAggregated(AGGREGATION_SUM, array, key);
}

// #endregion

// #region Exports

export {max, min} from './internal/math/aggregate';
export {floor, round} from './internal/math/misc';

// #endregion
