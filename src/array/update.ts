import {updateInArray} from '../internal/array/update';
import type {PlainObject} from '../models';

/**
 * Update an item in an array
 *
 * If the item exists, it will be updated; if it doesn't, it will be added
 *
 * @param destination Array to update within
 * @param updated Updated items
 * @param callback Callback to find existing item
 * @returns Original array
 *
 * @example
 * ```typescript
 * update(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   [{id: 2, name: 'Updated'}, {id: 4, name: 'New'}],
 *   item => item.id,
 * ); // => [{id: 1}, {id: 2, name: 'Updated'}, {id: 3}, {id: 4, name: 'New'}]
 * ```
 */
export function update<Item>(
	destination: Item[],
	updated: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
): Item[];

/**
 * Update an item in an array
 *
 * If the item exists, it will be updated; if it doesn't, it will be added
 *
 * @param destination Array to update within
 * @param updated Updated items
 * @param key Key to find existing item
 * @returns Original array
 *
 * @example
 * ```typescript
 * update(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   [{id: 2, name: 'Updated'}, {id: 4, name: 'New'}],
 *   'id',
 * ); // => [{id: 1}, {id: 2, name: 'Updated'}, {id: 3}, {id: 4, name: 'New'}]
 * ```
 */
export function update<Item extends PlainObject, ItemKey extends keyof Item>(
	destination: Item[],
	updated: Item[],
	key: ItemKey,
): Item[];

/**
 * Update an item in an array
 *
 * If the item exists, it will be updated; if it doesn't, it will be added
 *
 * @param destination Array to update within
 * @param updated Updated items
 * @returns Original array
 *
 * @example
 * ```typescript
 * update(
 *   [1, 2, 3],
 *   [2, 4],
 * ); // => [1, 2, 3, 4]
 * ```
 */
export function update<Item>(destination: Item[], updated: Item[]): Item[];

export function update(array: unknown[], values: unknown[], key?: unknown): unknown[] {
	return updateInArray(array, values, key, true);
}
