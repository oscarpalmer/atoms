import {findAbsoluteValueOrDefault} from '../internal/array/find';
import type {PlainObject} from '../models';

// #region Functions

/**
 * Get the first item matching the given value
 * @param array Array to search in
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns First item that matches the value, or `undefined` if no match is found
 */
export function first<Item, Callback extends (item: Item, index: number, array: Item[]) => unknown>(
	array: Item[],
	callback: Callback,
	value: ReturnType<Callback>,
): Item | undefined;

/**
 * Get the first item matching the given value by key
 * @param array Array to search in
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns First item that matches the value, or `undefined` if no match is found
 */
export function first<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): Item | undefined;

/**
 * Get the first item matching the filter
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @returns First item that matches the filter, or `undefined` if no match is found
 */
export function first<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): Item | undefined;

/**
 * Get the first item from an array
 * @param array Array to get from
 * @return First item from the array, or `undefined` if the array is empty
 */
export function first<Item>(array: Item[]): Item | undefined;

export function first(array: unknown[], ...parameters: unknown[]): unknown {
	return findAbsoluteValueOrDefault(array, parameters, undefined, false, false);
}

first.default = firstOrDefault;

/**
 * Get the first item matching the given value, or a default value if no match is found
 *
 * Available as `firstOrDefault` and `first.default`
 * @param array Array to search in
 * @param defaultValue Default value to return if no match is found
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns First item that matches the value, or the default value if no match is found
 */
export function firstOrDefault<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], defaultValue: Item, callback: Callback, value: ReturnType<Callback>): Item;

/**
 * Get the first item matching the given value by key, or a default value if no match is found
 *
 * Available as `firstOrDefault` and `first.default`
 * @param array Array to search in
 * @param defaultValue Default value to return if no match is found
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns First item that matches the value, or the default value if no match is found
 */

export function firstOrDefault<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	defaultValue: Item,
	key: ItemKey,
	value: Item[ItemKey],
): Item;

/**
 * Get the first item matching the filter, or a default value if no match is found
 *
 * Available as `firstOrDefault` and `first.default`
 * @param array Array to search in
 * @param defaultValue Default value to return if no match is found
 * @param filter Filter callback to match items
 * @returns First item that matches the filter, or the default value if no match is found
 */
export function firstOrDefault<Item>(
	array: Item[],
	defaultValue: Item,
	filter: (item: Item, index: number, array: Item[]) => boolean,
): Item;

/**
 * Get the first item from an array, or a default value if the array is empty
 *
 * Available as `firstOrDefault` and `first.default`
 * @param array Array to get from
 * @param defaultValue Default value to return if the array is empty
 * @return First item from the array, or the default value if the array is empty
 */
export function firstOrDefault<Item>(array: Item[], defaultValue: Item): Item;

export function firstOrDefault(
	array: unknown[],
	defaultValue: unknown,
	...parameters: unknown[]
): unknown {
	return findAbsoluteValueOrDefault(array, parameters, defaultValue, true, false);
}

// #endregion
