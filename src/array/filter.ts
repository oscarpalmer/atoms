import {findValues} from '../internal/array/find';
import type {Key, PlainObject} from '../models';

/**
 * Get a filtered array of items matching the given value
 * @param array Array to search in
 * @param value Value to search for
 * @returns Filtered array of items that match the value
 */
export function filter<Item>(array: Item[], value: Item): Item[];

/**
 * Get a filtered array of items matching the filter
 * @param array Array to search in
 * @param filter Function to match items in the array
 * @returns Filtered array of items that match the filter
 */
export function filter<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): Item[];

/**
 * Get a filtered array of items
 * @param array Array to search in
 * @param key Key to match items by
 * @param value Value to search for
 * @returns Filtered array of items that match the value
 */
export function filter<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): Item[];

/**
 * Get a filtered array of items
 * @param array Array to search in
 * @param callback Function to get a value from each item
 * @param value Value to search for
 * @returns Filtered array of items that match the value
 */
export function filter<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], callback: Callback, value: ReturnType<Callback>): Item[];

export function filter(array: unknown[], ...parameters: unknown[]): unknown[] {
	return findValues('all', array, parameters);
}
