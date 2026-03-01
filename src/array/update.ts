import {updateInArray} from '../internal/array/update';
import type {PlainObject} from '../models';

/**
 * Update an item in an array: if the item exists, it will be updated; if it doesn't, it will be added
 * @param destination Array to update within
 * @param updated Updated items
 * @param callback Callback to find existing item
 * @return Original array
 */
export function update<Item>(
	destination: Item[],
	updated: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
): Item[];

/**
 * Update an item in an array: if the item exists, it will be updated; if it doesn't, it will be added
 * @param destination Array to update within
 * @param updated Updated items
 * @param key Key to find existing item
 * @return Original array
 */
export function update<Item extends PlainObject, Key extends keyof Item>(
	destination: Item[],
	updated: Item[],
	key: Key,
): Item[];

/**
 * Update an item in an array: if the item exists, it will be updated; if it doesn't, it will be added
 * @param destination Array to update within
 * @param updated Updated items
 * @returns Original array
 */
export function update<Item>(destination: Item[], updated: Item[]): Item[];

export function update(array: unknown[], values: unknown[], key?: unknown): unknown[] {
	return updateInArray(array, values, key, true);
}
