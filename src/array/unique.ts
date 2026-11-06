import {getArrayCallback} from '../internal/array/callbacks';
import {ARRAY_UNIQUE_THRESHOLD} from '../models/array/array.misc.model';
import type {PlainObject} from '../models/index';

// #region Functions

/**
 * Get an array of unique items
 *
 * @param array Original array
 * @param callback Callback to get an item's value
 * @returns Array of unique items
 *
 * @example
 * ```typescript
 * unique(
 *   [{id: 1}, {id: 2}, {id: 3}, {id: 2}],
 *   item => item.id,
 * ); // => [{id: 1}, {id: 2}, {id: 3}]
 * ```
 */
export function unique<Item>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
): Item[];

/**
 * Get an array of unique items
 *
 * @param array Original array
 * @param key Key to use for unique value
 * @returns Array of unique items
 *
 * @example
 * ```typescript
 * unique(
 *   [{id: 1}, {id: 2}, {id: 3}, {id: 2}],
 *   'id',
 * ); // => [{id: 1}, {id: 2}, {id: 3}]
 * ```
 */
export function unique<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
): Item[];

/**
 * Get an array of unique items
 *
 * @param array Original array
 * @returns Array of unique items
 *
 * @example
 * ```typescript
 * unique([1, 2, 3, 2]); // => [1, 2, 3]
 * ```
 */
export function unique<Item>(array: Item[]): Item[];

export function unique(array: unknown[], key?: unknown): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	const {length} = array;

	if (length < 2) {
		return array.slice();
	}

	const callback = getArrayCallback(key);

	if (callback == null && length >= ARRAY_UNIQUE_THRESHOLD) {
		return [...new Set(array)];
	}

	const keyed = new Set();
	const uniques: unknown[] = [];

	for (let index = 0; index < length; index += 1) {
		const item = array[index];
		const value = callback == null ? item : callback(item, index, array);

		if (!keyed.has(value)) {
			keyed.add(value);
			uniques.push(item);
		}
	}

	return uniques;
}

// #endregion
