import {aggregate, type OnlyNumericalKeys} from './internal/math/aggregate';
import type {PlainObject} from './models';

/**
 * Get the average value from a list of numbers
 * @param values List of numbers
 * @returns Average value, or `NaN` if no average can be calculated
 */
export function average(values: number[]): number;

/**
 * Get the average value from a list of objects
 * @param array List of objects to calculate the average for
 * @param key Key to get a numerical value from each object
 * @returns Average value, or `NaN` if no average can be calculated
 */
export function average<Item extends PlainObject>(
	array: Item[],
	key: keyof OnlyNumericalKeys<Item>,
): number;

/**
 * Get the average value from a list of values
 * @param array List of values to calculate the average for
 * @param callback Function to get a numerical value from each value
 * @returns Average value, or `NaN` if no average can be calculated
 */
export function average<Item extends PlainObject>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): number;

export function average(array: unknown[], key?: unknown): number {
	const aggregated = aggregate('average', array, key);

	return aggregated.count > 0
		? aggregated.value / aggregated.count
		: Number.NaN;
}

/**
 * Count the number of items in an array
 * @param values Array to count for
 * @return Number of items, or `NaN` if no count can be calculated
 */
export function count(values: unknown[]): number;

/**
 * Count the number of items in an array that have a specific key value
 * @param array Array to count for
 * @param key Key to get value from each item
 * @param value Value to count for each item
 * @returns Number of items with the specified key value, or `NaN` if no count can be calculated
 */
export function count<Item extends PlainObject>(
	array: Item[],
	key: keyof Item,
	value: unknown,
): number;

/**
 * Count the number of items in an array that match a specific condition value
 * @param array Array to count for
 * @param callback Function to get value from each item
 * @param value Value to count for each item
 * @returns Number of items that match the condition, or `NaN` if no count can be calculated
 */
export function count<Item extends PlainObject>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
	value: unknown,
): number;

export function count(
	array: unknown[],
	key?: unknown,
	value?: unknown,
): number {
	if (!Array.isArray(array)) {
		return Number.NaN;
	}

	const {length} = array;

	if (key == null) {
		return length;
	}

	if (typeof key !== 'string' && typeof key !== 'function') {
		return Number.NaN;
	}

	const callback =
		typeof key === 'function' ? key : (item: PlainObject) => item[key as never];

	let count = 0;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		if (Object.is(callback(item as never, index, array), value)) {
			count += 1;
		}
	}

	return count;
}

/**
 * Get the minimum value from a list of numbers
 * @param values List of numbers
 * @returns Minimum value, or `NaN` if no minimum can be found
 */
export function min(values: number[]): number;

/**
 * Get the minimum value from a list of objects
 * @param array List of objects
 * @param key Key to get a numerical value from each object
 * @returns Minimum value, or `NaN` if no minimum can be found
 */
export function min<Item extends PlainObject>(
	array: Item[],
	key: keyof OnlyNumericalKeys<Item>,
): number;

/**
 * Get the minimum value from a list of objects
 * @param array List of objects
 * @param callback Function to get a numerical value from each object
 * @returns Minimum value, or `NaN` if no minimum can be found
 */
export function min<Item extends PlainObject>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): number;

export function min(array: unknown[], key?: unknown): number {
	const aggregated = aggregate('min', array, key);

	return aggregated.count > 0 ? aggregated.value : Number.NaN;
}

/**
 * Round a number
 * @param value Number to round
 * @param decimals Number of decimal places to round to _(defaults to `0`)_
 * @returns Rounded number, or `NaN` if the value if unable to be rounded
 */
export function round(value: number, decimals?: number): number {
	if (typeof value !== 'number') {
		return Number.NaN;
	}

	if (typeof decimals !== 'number' || decimals < 1) {
		return Math.round(value);
	}

	const mod = 10 ** decimals;

	return Math.round((value + Number.EPSILON) * mod) / mod;
}

/**
 * Get the sum of a list of numbers
 * @param values List of numbers
 * @returns Sum of the numbers, or `NaN` if no sum can be calculated
 */
export function sum(values: number[]): number;

/**
 * Get the sum of a list of objects
 * @param array List of objects
 * @param key Key to get a numerical value from each object
 * @returns Sum of the values, or `NaN` if no sum can be calculated
 */
export function sum<Item extends PlainObject>(
	array: Item[],
	key: keyof OnlyNumericalKeys<Item>,
): number;

/**
 * Get the sum of a list of objects
 * @param array List of objects
 * @param callback Function to get a numerical value from each object
 * @returns Sum of the values, or `NaN` if no sum can be calculated
 */
export function sum<Item extends PlainObject>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): number;

export function sum(array: unknown[], key?: unknown): number {
	const aggregated = aggregate('sum', array, key);

	return aggregated.count > 0 ? aggregated.value : Number.NaN;
}

export {max, type OnlyNumericalKeys} from './internal/math/aggregate';
