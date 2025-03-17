import {findValues} from '../internal/array/find';
import type {Key, PlainObject} from '../models';

/**
 * Get the number of items _(count)_ that match the given value
 */
export function count<Item>(array: Item[], value: Item): number;

/**
 * Get the number of items _(count)_ that match the given value
 */
export function count<Item>(
	array: Item[],
	matches: (item: Item, index: number, array: Item[]) => boolean,
): number;

/**
 * Get the number of items _(count)_ that match the given value
 */
export function count<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): number;

/**
 * Get the number of items _(count)_ that match the given value
 */
export function count<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], key: ItemKey, value: ReturnType<ItemKey>): number;

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
