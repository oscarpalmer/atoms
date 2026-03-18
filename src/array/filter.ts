import {FIND_VALUES_ALL, findValues} from '../internal/array/find';
import type {PlainObject} from '../models';

// #region Functions

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

filter.remove = removeFiltered;

function removeFiltered<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], callback: Callback, value: ReturnType<Callback>): unknown[];

function removeFiltered<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): unknown[];

function removeFiltered<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): unknown[];

function removeFiltered<Item>(array: Item[], item: Item): unknown[];

function removeFiltered(array: unknown[], ...parameters: unknown[]): unknown[] {
	return findValues(FIND_VALUES_ALL, array, parameters).notMatched;
}

// #endregion
