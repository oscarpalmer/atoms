import {findAbsoluteValueOrDefault} from '../internal/array/find';
import type {PlainObject} from '../models';

// #region Functions

/**
 * Get the last items matching the given value
 * @param array Array to search in
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns Last item that matches the value, or `undefined` if no match is found
 */
export function last<Item, Callback extends (item: Item, index: number, array: Item[]) => unknown>(
	array: Item[],
	callback: Callback,
	value: ReturnType<Callback>,
): Item | undefined;

/**
 * Get the first item matching the given value by key
 * @param array Array to search in
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns Last item that matches the value, or `undefined` if no match is found
 */
export function last<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): Item | undefined;

/**
 * Get the last item matching the filter
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @returns Last item that matches the filter, or `undefined` if no match is found
 */
export function last<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): Item | undefined;

/**
 * Get the last item from an array
 * @param array Array to get from
 * @return Last item from the array, or `undefined` if the array is empty
 */
export function last<Item>(array: Item[]): Item | undefined;

export function last(array: unknown[], ...parameters: unknown[]): unknown {
	return findAbsoluteValueOrDefault(array, parameters, undefined, false, true);
}

last.default = lastOrDefault;

/**
 * Get the last item matching the given value
 * @param array Array to search in
 * @param defaultValue Default value to return if no match is found
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns Last item that matches the value, or the default value if no match is found
 */
function lastOrDefault<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], defaultValue: Item, callback: Callback, value: ReturnType<Callback>): Item;

/**
 * Get the last item matching the given value by key
 * @param array Array to search in
 * @param defaultValue Default value to return if no match is found
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns Last item that matches the value, or the default value if no match is found
 */
function lastOrDefault<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	defaultValue: Item,
	key: ItemKey,
	value: Item[ItemKey],
): Item;

/**
 * Get the last item matching the filter
 * @param array Array to search in
 * @param defaultValue Default value to return if no match is found
 * @param filter Filter callback to match items
 * @returns Last item that matches the filter, or the default value if no match is found
 */
function lastOrDefault<Item>(
	array: Item[],
	defaultValue: Item,
	filter: (item: Item, index: number, array: Item[]) => boolean,
): Item;

/**
 * Get the last item from an array
 * @param array Array to get from
 * @param defaultValue Default value to return if the array is empty
 * @return Last item from the array, or the default value if the array is empty
 */
function lastOrDefault<Item>(array: Item[], defaultValue: Item): Item;

function lastOrDefault(array: unknown[], defaultValue: unknown, ...parameters: unknown[]): unknown {
	return findAbsoluteValueOrDefault(array, parameters, defaultValue, true, true);
}

// #endregion
