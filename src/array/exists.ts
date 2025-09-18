import {findValue} from '../internal/array/find';
import type {PlainObject} from '../models';

/**
 * Does the value exist in the array?
 * @param array Array to search in
 * @param value Value to search for
 * @returns `true` if the value exists in the array, otherwise `false`
 */
export function exists<Item>(array: Item[], value: Item): boolean;

/**
 * Does any item in the array match the filter?
 * @param array Array to search in
 * @param filter Function to match items
 * @returns `true` if a matching item exists, otherwise `false`
 */
export function exists<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): boolean;

/**
 * Does the value exist in the array?
 * @param array Array to search in
 * @param key Key to search items by
 * @param value Value to search for
 * @returns `true` if the value exists in the array, otherwise `false`
 */
export function exists<Item extends PlainObject>(
	array: Item[],
	key: keyof Item,
	value: unknown,
): boolean;

/**
 * Does the value exist in the array?
 * @param array Array to search in
 * @param callback Function to get a value from each item
 * @param value Value to search for
 * @returns `true` if the value exists in the array, otherwise `false`
 */
export function exists<Item>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
	value: unknown,
): boolean;

export function exists(array: unknown[], ...parameters: unknown[]): boolean {
	if (parameters.length === 1 && typeof parameters[0] !== 'function') {
		return Array.isArray(array) ? array.includes(parameters[0]) : false;
	}

	return (findValue('index', array, parameters) as number) > -1;
}
