import {FIND_VALUE_INDEX, findValue} from '../internal/array/find';
import type {PlainObject} from '../models';

// #region Functions

/**
 * Does an item with a specific value exist in the array?
 * @param array Array to search in
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns `true` if the item exists in the array, otherwise `false`
 */
export function exists<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], callback: Callback, value: ReturnType<Callback>): boolean;

/**
 * Does an item with a specific value exist in the array?
 * @param array Array to search in
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns `true` if the item exists in the array, otherwise `false`
 */
export function exists<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): boolean;

/**
 * Does an item in the array match the filter?
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @returns `true` if a matching item exists, otherwise `false`
 */
export function exists<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): boolean;

/**
 * Does the item exist in the array?
 * @param array Array to search in
 * @param item Item to search for
 * @returns `true` if the item exists in the array, otherwise `false`
 */
export function exists<Item>(array: Item[], item: Item): boolean;

export function exists(array: unknown[], ...parameters: unknown[]): boolean {
	if (parameters.length === 1 && typeof parameters[0] !== 'function') {
		return Array.isArray(array) ? array.includes(parameters[0]) : false;
	}

	return (findValue(FIND_VALUE_INDEX, array, parameters) as number) > -1;
}

// #endregion
