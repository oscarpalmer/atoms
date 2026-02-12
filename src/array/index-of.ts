import {findValue} from '../internal/array/find';
import type {PlainObject} from '../models';

// #region Functions

/**
 * Get the index of the first matching item by callback
 * @param array Array to search in
 * @param callback Callback to get an item's value
 * @param value Value to match against
 * @returns Index of the first matching item, or `-1` if no match is found
 */
export function indexOf<Item>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
	value: unknown,
): number;

/**
 * Get the index of the first matching item by key
 * @param array Array to search in
 * @param key Key to match items by
 * @param value Value to match against
 * @returns Index of the first matching item, or `-1` if no match is found
 */
export function indexOf<Item extends PlainObject>(
	array: Item[],
	key: keyof Item,
	value: unknown,
): number;

/**
 * Get the index of the first item matching the filter
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @returns Index of the first matching item, or `-1` if no match is found
 */
export function indexOf<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): number;

/**
 * Get the index of the first item matching the given item
 * @param array Array to search in
 * @param item Item to match against
 * @returns Index of the first matching item, or `-1` if no match is found
 */
export function indexOf<Item>(array: Item[], item: Item): number;

export function indexOf(array: unknown[], ...parameters: unknown[]): number {
	return findValue('index', array, parameters) as number;
}

// #endregion
