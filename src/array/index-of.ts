import {findValue} from '../internal/array/find';
import type {PlainObject} from '../models';

/**
 * Get the index for the first item matching the given item
 * @param array Array to search in
 * @param value Item to search for
 * @returns Index of the first matching item, or `-1` if no match is found
 */
export function indexOf<Item>(array: Item[], value: Item): number;

/**
 * Get the index for the first item matching the filter
 * @param array Array to search in
 * @param filter Function to match items
 * @returns Index of the first matching item, or `-1` if no match is found
 */
export function indexOf<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): number;

/**
 * Get the index for the first matching item by key
 * @param array Array to search in
 * @param key Key to match items by
 * @param value Value to search for
 * @returns Index of the first matching item, or `-1` if no match is found
 */
export function indexOf<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): number;

/**
 * Get the index for the first matching item by callback
 * @param array Array to search in
 * @param callback Function to get a value from each item
 * @param value Value to search for
 * @returns Index of the first matching item, or `-1` if no match is found
 */
export function indexOf<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], callback: Callback, value: ReturnType<Callback>): number;

export function indexOf(array: unknown[], ...parameters: unknown[]): number {
	return findValue('index', array, parameters) as number;
}
