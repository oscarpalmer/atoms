import {FIND_VALUES_ALL, findValues} from '../internal/array/find';
import type {PlainObject} from '../models';

// #region Functions

/**
 * Get a filtered array of items that do not match the filter
 *
 * Available as `exclude` and `filter.remove`
 * @param array Array to search in
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns Filtered array of items that do not match the filter
 */
export function exclude<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], callback: Callback, value: ReturnType<Callback>): unknown[];

/**
 * Get a filtered array of items that do not match the filter
 *
 * Available as `exclude` and `filter.remove`
 * @param array Array to search in
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns Filtered array of items that do not match the filter
 */
export function exclude<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): unknown[];

/**
 * Get a filtered array of items that do not match the filter
 *
 * Available as `exclude` and `filter.remove`
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @returns Filtered array of items that do not match the filter
 */
export function exclude<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): unknown[];

/**
 * Get a filtered array of items that do not match the given item
 *
 * Available as `exclude` and `filter.remove`
 * @param array Array to search in
 * @param item Item to match against
 * @returns Filtered array of items that do not match the given item
 */
export function exclude<Item>(array: Item[], item: Item): unknown[];

export function exclude(array: unknown[], ...parameters: unknown[]): unknown[] {
	return findValues(FIND_VALUES_ALL, array, parameters).notMatched;
}

/**
 * Get a filtered array of items
 * @param array Array to search in
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns Filtered array of items
 */
export function filter<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], callback: Callback, value: ReturnType<Callback>): Item[];

/**
 * Get a filtered array of items
 * @param array Array to search in
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns Filtered array of items
 */
export function filter<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): Item[];

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
 * Get a filtered array of items matching the given item
 * @param array Array to search in
 * @param item Item to match against
 * @returns Filtered array of items
 */
export function filter<Item>(array: Item[], item: Item): Item[];

export function filter(array: unknown[], ...parameters: unknown[]): unknown[] {
	return findValues(FIND_VALUES_ALL, array, parameters).matched;
}

filter.remove = exclude;

// #endregion
