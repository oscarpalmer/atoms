import {updateInArray} from '../internal/array/update';
import type {PlainObject} from '../models';

/**
 * Toggle an item in an array: if the item exists, it will be removed; if it doesn't, it will be added
 * @param destination Array to toggle within
 * @param toggled Toggled items
 * @param callback Callback to find existing item
 * @returns Original array
 */
export function toggle<Item>(
	destination: Item[],
	toggled: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
): Item[];

/**
 * Toggle an item in an array: if the item exists, it will be removed; if it doesn't, it will be added
 * @param destination Array to toggle within
 * @param toggled Toggled items
 * @param key Key to find existing item
 * @returns Original array
 */
export function toggle<Item extends PlainObject, ItemKey extends keyof Item>(
	destination: Item[],
	toggled: Item[],
	key: ItemKey,
): Item[];

/**
 * Toggle an item in an array: if the item exists, it will be removed; if it doesn't, it will be added
 * @param destination Array to toggle within
 * @param toggled Toggled items
 * @returns Original array
 */
export function toggle<Item>(destination: Item[], toggled: Item[]): Item[];

export function toggle(array: unknown[], values: unknown[], key?: unknown): unknown[] {
	return updateInArray(array, values, key, false);
}
