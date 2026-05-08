import {updateInArray} from '../internal/array/update';
import type {PlainObject} from '../models';

// #region Functions

/**
 * Toggle an item in an array
 *
 * If the item exists, it will be removed; if it doesn't, it will be added
 *
 * @param destination Array to toggle within
 * @param toggled Toggled items
 * @param callback Callback to find existing item
 * @returns Original array
 *
 * @example
 * ```typescript
 * toggle(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   [{id: 2}, {id: 4}],
 *   item => item.id,
 * ); // => [{id: 1}, {id: 3}, {id: 4}]
 * ```
 */
export function toggle<Item>(
	destination: Item[],
	toggled: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
): Item[];

/**
 * Toggle an item in an array
 *
 * If the item exists, it will be removed; if it doesn't, it will be added
 *
 * @param destination Array to toggle within
 * @param toggled Toggled items
 * @param key Key to find existing item
 * @returns Original array
 *
 * @example
 * ```typescript
 * toggle(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   [{id: 2}, {id: 4}],
 *   'id',
 * ); // => [{id: 1}, {id: 3}, {id: 4}]
 * ```
 */
export function toggle<Item extends PlainObject, ItemKey extends keyof Item>(
	destination: Item[],
	toggled: Item[],
	key: ItemKey,
): Item[];

/**
 * Toggle an item in an array
 *
 * If the item exists, it will be removed; if it doesn't, it will be added
 *
 * @param destination Array to toggle within
 * @param toggled Toggled items
 * @returns Original array
 *
 * @example
 * ```typescript
 * toggle(
 *   [1, 2, 3],
 *   [2, 4],
 * ); // => [1, 3, 4]
 * ```
 */
export function toggle<Item>(destination: Item[], toggled: Item[]): Item[];

export function toggle(array: unknown[], values: unknown[], key?: unknown): unknown[] {
	return updateInArray(array, values, key, false);
}

// #endregion
