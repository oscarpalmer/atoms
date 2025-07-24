import {findValues} from '../internal/array/find';
import type {Key, PlainObject} from '../models';

/**
 * Get an array of unique items
 * @param array Array to get unique items from
 * @returns Array of unique items
 */
export function unique<Item>(array: Item[]): Item[];

/**
 * Get an array of unique items
 * @param array Array to get unique items from
 * @param key Key to use for comparison
 * @returns Array of unique items
 */
export function unique<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
): Item[];

/**
 * Get an array of unique items
 * @param array Array to get unique items from
 * @param key Key to use for comparison
 * @param value Value to use for comparison
 * @returns Array of unique items
 */
export function unique<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], key: ItemKey): Item[];

export function unique(array: unknown[], key?: unknown): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	return array.length > 1
		? findValues('unique', array, [key, undefined])
		: array;
}
