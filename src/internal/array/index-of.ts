import {FIND_VALUE_INDEX, findValue} from './find';
import type {PlainObject} from '../../models';

// #region Functions

/**
 * Get the index of the first matching item by callback
 * @param array Array to search in
 * @param callback Callback to get an item's value
 * @param value Value to match against
 * @returns Index of the first matching item, or `-1` if no match is found
 */
export function indexOf<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], callback: Callback, value: ReturnType<Callback>): number;

/**
 * Get the index of the first matching item by key
 * @param array Array to search in
 * @param key Key to match items by
 * @param value Value to match against
 * @returns Index of the first matching item, or `-1` if no match is found
 */
export function indexOf<Item extends PlainObject, Key extends keyof Item>(
	array: Item[],
	key: Key,
	value: Item[Key],
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
	return findValue(FIND_VALUE_INDEX, array, parameters) as number;
}

// #endregion
