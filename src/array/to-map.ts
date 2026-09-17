import {getArrayCallbacks} from '../internal/array/callbacks';
import type {Key, KeyOrCallback, KeyOrCallbackKey, KeyOrCallbackValue} from '../models';

// #region Functions

function getMapValues(
	array: unknown[],
	first: unknown,
	second: unknown,
	arrays: boolean,
): Map<unknown, unknown> {
	if (!Array.isArray(array)) {
		return new Map();
	}

	const {length} = array;
	const callbacks = getArrayCallbacks(undefined, first, second);
	const map = new Map<Key, unknown>();

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		const key = callbacks?.keyed?.(item, index, array) ?? index;
		const value = callbacks?.value?.(item, index, array) ?? item;

		if (arrays) {
			const existing = map.get(key);

			if (existing == null) {
				map.set(key, [value]);
			} else {
				(existing as unknown[]).push(value);
			}
		} else {
			map.set(key, value);
		}
	}

	return map;
}

/**
 * Create a _Map_ from an array of items using a specific key
 *
 * If multiple items have the same key, the latest item's value will be used
 *
 * @param array Array to convert
 * @param key Callback or key to use for grouping
 * @param value Callback or key to use for value, defaulting to the item itself
 * @returns _Map_ of keyed values
 *
 * @example
 * ```typescript
 * toMap(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   item => item.value,
 *   item => item.id,
 * ); // => Map { 10 => 3, 20 => 2 }
 * ```
 */
export function toMap<
	Item,
	KeyArg extends KeyOrCallback<Item, Key>,
	ValueArg extends KeyOrCallback<Item>,
>(
	array: Item[],
	key: KeyArg,
	value: ValueArg,
): Map<KeyOrCallbackKey<Item, KeyArg>, KeyOrCallbackValue<Item, ValueArg>>;

/**
 * Create a _Map_ from an array of items using a specific key
 *
 * If multiple items have the same key, the latest item will be used
 *
 * @param array Array to convert
 * @param key Callback or key to use for grouping
 * @returns _Map_ of keyed items
 *
 * @example
 * ```typescript
 * toMap(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   item => item.value,
 * ); // => Map { 10 => {id: 3, value: 10}, 20 => {id: 2, value: 20} }
 * ```
 */
export function toMap<Item, KeyArg extends KeyOrCallback<Item, Key>>(
	array: Item[],
	key: KeyArg,
): Map<KeyOrCallbackKey<Item, KeyArg>, Item>;

/**
 * Create a _Map_ from an array of items _(using indices as keys)_
 *
 * @param array Array to convert
 * @returns _Map_ of indiced items
 *
 * @example
 * ```typescript
 * toMap(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 * ); // => Map { 0 => {id: 1, value: 10}, 1 => {id: 2, value: 20}, 2 => {id: 3, value: 10} }
 * ```
 */
export function toMap<Item>(array: Item[]): Map<number, Item>;

export function toMap(array: unknown[], first?: unknown, second?: unknown): unknown {
	return getMapValues(array, first, second, false);
}

/**
 * Create a _Map_ from an array of items using a specific key, grouping values into arrays
 *
 * _Available as `toMapArrays` and `toMap.arrays`_
 *
 * @param array Array to convert
 * @param key Callback or key to use for grouping
 * @param value Callback or key to use for value, defaulting to the item itself
 * @returns _Map_ of keyed arrays of values
 *
 * @example
 * ```typescript
 * toMapArrays(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   item => item.value,
 *   item => item.id,
 * ); // => Map { 10 => [1, 3], 20 => [2] }
 * ```
 */
export function toMapArrays<
	Item,
	KeyArg extends KeyOrCallback<Item, Key>,
	ValueArg extends KeyOrCallback<Item>,
>(
	array: Item[],
	key: KeyArg,
	value: ValueArg,
): Map<KeyOrCallbackKey<Item, KeyArg>, Array<KeyOrCallbackValue<Item, ValueArg>>>;

/**
 * Create a _Map_ from an array of items using a specific key, grouping items into arrays
 *
 * _Available as `toMapArrays` and `toMap.arrays`_
 *
 * @param array Array to convert
 * @param key Callback or key to use for grouping
 * @returns _Map_ of keyed arrays of items
 *
 * @example
 * ```typescript
 * toMapArrays(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   item => item.value,
 * ); // => Map { 10 => [{id: 1, value: 10}, {id: 3, value: 10}], 20 => [{id: 2, value: 20}] }
 * ```
 */
export function toMapArrays<Item, KeyArg extends KeyOrCallback<Item, Key>>(
	array: Item[],
	key: KeyArg,
): Map<KeyOrCallbackKey<Item, KeyArg>, Item[]>;

export function toMapArrays(array: unknown[], first?: unknown, second?: unknown): unknown {
	return getMapValues(array, first, second, true);
}

// #endregion

// #region Initialization

toMap.arrays = toMapArrays;

// #endregion
