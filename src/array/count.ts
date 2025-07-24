import {findValues} from '../internal/array/find';
import type {PlainObject} from '../models';

/**
 * Get the number of items that match the given value
 * @param array Array to count items in
 * @param value Value to count in the array
 * @returns Matching count
 */
export function count<Item>(array: Item[], value: Item): number;

/**
 * Get the number of items that match the filter
 * @param array Array to count items in
 * @param filter Function to match items
 * @returns Matching count
 */
export function count<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): number;

/**
 * Get the number of items that match the given value by key
 * @param array Array to count items in
 * @param key Key to match items by
 * @param value Value to count in the array
 * @returns Matching count
 */
export function count<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): number;

/**
 * Get the number of items that match the given value
 * @param array Array to count items in
 * @param callback Function to get a value from each item
 * @param value Value to count in the array
 * @returns Matching count
 */
export function count<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], callback: Callback, value: ReturnType<Callback>): number;

export function count(array: unknown[], ...parameters: unknown[]): number {
	if (
		Array.isArray(parameters) &&
		parameters.length === 1 &&
		typeof parameters[0] !== 'function'
	) {
		if (!Array.isArray(array)) {
			return Number.NaN;
		}

		const {length} = array;

		if (length === 0) {
			return 0;
		}

		const value = parameters[0];

		let result = 0;

		for (let index = 0; index < length; index += 1) {
			result += Object.is(array[index], value) ? 1 : 0;
		}

		return result;
	}

	return findValues('all', array, parameters, true)?.length ?? Number.NaN;
}
