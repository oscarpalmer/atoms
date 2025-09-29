import {findValues} from '../internal/array/find';
import type {Key, PlainObject} from '../models';

/**
 * Get an array of unique items
 * @param array Original array
 * @returns Array of unique items
 */
export function unique<Item>(array: Item[]): Item[];

/**
 * Get an array of unique items
 * @param array Original array
 * @param key Key to use for unique value
 * @returns Array of unique items
 */
export function unique<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
): Item[];

/**
 * Get an array of unique items
 * @param array Original array
 * @param callback Callback to get an item's value
 * @returns Array of unique items
 */
export function unique<
	Item,
	ItemCallback extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], callback: ItemCallback): Item[];

export function unique(array: unknown[], key?: unknown): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	return array.length > 1
		? findValues('unique', array, [key, undefined])
		: array;
}
