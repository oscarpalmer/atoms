import {getArrayCallbacks} from '../internal/array/callbacks';
import type {PlainObject} from '../models';

// #region Functions

/**
 * Create a _Set_ from an array of items using a callback
 *
 * @param array Array to convert
 * @param callback Callback to get an item's value
 * @returns _Set_ of values
 *
 * @example
 * ```typescript
 * toSet(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   item => item.id,
 * ); // => Set { 1, 2, 3 }
 * ```
 */
export function toSet<Item, Callback extends (item: Item, index: number, array: Item[]) => unknown>(
	array: Item[],
	callback: Callback,
): Set<ReturnType<Callback>>;

/**
 * Create a _Set_ from an array of items using a key
 *
 * @param array Array to convert
 * @param key Key to use for value
 * @returns _Set_ of values
 *
 * @example
 * ```typescript
 * toSet(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   'id',
 * ); // => Set { 1, 2, 3 }
 * ```
 */
export function toSet<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
): Set<Item[ItemKey]>;

/**
 * Create a _Set_ from an array of items
 *
 * @param array Array to convert
 * @returns _Set_ of items
 *
 * @example
 * ```typescript
 * toSet([1, 2, 3]); // => Set { 1, 2, 3 }
 * ```
 */
export function toSet<Item>(array: Item[]): Set<Item>;

export function toSet(array: unknown[], value?: unknown): Set<unknown> {
	if (!Array.isArray(array)) {
		return new Set();
	}

	const callbacks = getArrayCallbacks(undefined, undefined, value);

	if (callbacks?.value == null) {
		return new Set(array);
	}

	const {length} = array;
	const set = new Set<unknown>();

	for (let index = 0; index < length; index += 1) {
		set.add(callbacks.value(array[index], index, array));
	}

	return set;
}

// #endregion
