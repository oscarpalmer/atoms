import {FIND_VALUES_UNIQUE, findValues} from '../internal/array/find';
import type {PlainObject} from '../models';

// #region Functions

/**
 * Get an array of unique items
 * @param array Original array
 * @param callback Callback to get an item's value
 * @returns Array of unique items
 */
export function unique<Item>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
): Item[];

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
 * @returns Array of unique items
 */
export function unique<Item>(array: Item[]): Item[];

export function unique(array: unknown[], key?: unknown): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	return array.length > 1 ? findValues(FIND_VALUES_UNIQUE, array, [key, undefined]).matched : array;
}

// #endregion
