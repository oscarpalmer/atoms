import {findValue} from '../internal/array/find';
import type {PlainObject} from '../models';

/**
 * Get the first item matching the given value
 * @param array Array to search in
 * @param value Value to search for
 * @returns First item that matches the value, or `undefined` if no match is found
 */
export function find<Item>(array: Item[], value: Item): Item | undefined;

/**
 * Get the first item matching the filter
 * @param array Array to search in
 * @param filter Function to match items in the array
 * @returns First item that matches the filter, or `undefined` if no match is found
 */
export function find<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): Item | undefined;

/**
 * Get the first item matching the given value by key
 * @param array Array to search in
 * @param key Key to match items by
 * @param value Value to search for
 * @returns First item that matches the value, or `undefined` if no match is found
 */
export function find<Item extends PlainObject>(
	array: Item[],
	key: keyof Item,
	value: unknown,
): Item | undefined;

/**
 * Get the first items matching the given value
 * @param array Array to search in
 * @param callback Function to get a value from each item
 * @param value Value to search for
 * @returns First item that matches the value, or `undefined` if no match is found
 */
export function find<Item>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
	value: unknown,
): Item | undefined;

export function find<Item>(
	array: unknown[],
	...parameters: unknown[]
): Item | undefined {
	return findValue('value', array, parameters) as Item | undefined;
}
