import {findValues} from '../internal/array/find';
import type {PlainObject} from '../models';

/**
 * Get a filtered array of items matching the given item
 * @param array Array to search in
 * @param item Item to match against
 * @returns Filtered array of items
 */
export function filter<Item>(array: Item[], item: Item): Item[];

/**
 * Get a filtered array of items matching the filter
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @returns Filtered array of items
 */
export function filter<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): Item[];

/**
 * Get a filtered array of items
 * @param array Array to search in
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns Filtered array of items
 */
export function filter<Item extends PlainObject>(
	array: Item[],
	key: keyof Item,
	value: unknown,
): Item[];

/**
 * Get a filtered array of items
 * @param array Array to search in
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns Filtered array of items
 */
export function filter<Item>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
	value: unknown,
): Item[];

export function filter(array: unknown[], ...parameters: unknown[]): unknown[] {
	return findValues('all', array, parameters);
}
