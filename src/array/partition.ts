import {FIND_VALUES_ALL, findValues} from '../internal/array/find';
import type {PlainObject} from '../models';

// #region Functions

/**
 * Get a partitioned array of items
 * @param array Array to search in
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns Partitioned array of items
 */
export function partition<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], callback: Callback, value: ReturnType<Callback>): Item[][];

/**
 * Get a partitioned array of items
 * @param array Array to search in
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns Partitioned array of items
 */
export function partition<Item extends PlainObject, Key extends keyof Item>(
	array: Item[],
	key: Key,
	value: Item[Key],
): Item[][];

/**
 * Get a partitioned array of items
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @returns Partitioned array of items
 */
export function partition<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): Item[][];

/**
 * Get a partitioned array of items matching the given item
 * @param array Array to search in
 * @param item Item to match against
 * @returns Partitioned array of items
 */
export function partition<Item>(array: Item[], item: Item): Item[][];

export function partition(array: unknown[], ...parameters: unknown[]): unknown[][] {
	const {matched, notMatched} = findValues(FIND_VALUES_ALL, array, parameters);

	return [matched, notMatched];
}

// #endregion
