import {FIND_VALUE_VALUE, findValue} from '../internal/array/find';
import type {PlainObject} from '../models';

// #region Functions

/**
 * Get the first items matching the given value
 * @param array Array to search in
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns First item that matches the value, or `undefined` if no match is found
 */
export function find<Item, Callback extends (item: Item, index: number, array: Item[]) => unknown>(
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
export function find<Item extends PlainObject, ItemKey extends keyof Item>(
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
export function find<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): Item | undefined;

/**
 * Get the first item matching the given value
 * @param array Array to search in
 * @param value Value to match against
 * @returns First item that matches the value, or `undefined` if no match is found
 */
export function find<Item>(array: Item[], value: Item): Item | undefined;

export function find<Item>(array: unknown[], ...parameters: unknown[]): Item | undefined {
	return findValue(FIND_VALUE_VALUE, array, parameters) as Item | undefined;
}

// #endregion
