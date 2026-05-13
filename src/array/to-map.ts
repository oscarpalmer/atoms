import {getArrayCallbacks} from '../internal/array/callbacks';
import type {Key, PlainObject} from '../models';

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
 * Create a _Map_ from an array of items using callbacks
 *
 * If multiple items have the same key, the latest item's value will be used
 *
 * @param array Array to convert
 * @param key Callback to get an item's grouping key
 * @param value Callback to get an item's value
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
	KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
	ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: KeyCallback,
	value: ValueCallback,
): Map<ReturnType<KeyCallback>, ReturnType<ValueCallback>>;

/**
 * Create a _Map_ from an array of items using a callback and value
 *
 * If multiple items have the same key, the latest item's value will be used
 *
 * @param array Array to convert
 * @param key Callback to get an item's grouping key
 * @param value Key to use for value
 * @returns _Map_ of keyed values
 *
 * @example
 * ```typescript
 * toMap(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   item => item.value,
 *   'id',
 * ); // => Map { 10 => 3, 20 => 2 }
 * ```
 */
export function toMap<
	Item extends PlainObject,
	KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends keyof Item,
>(array: Item[], key: KeyCallback, value: ItemValue): Map<ReturnType<KeyCallback>, Item[ItemValue]>;

/**
 * Create a _Map_ from an array of items using a key and callback
 *
 * If multiple items have the same key, the latest item's value will be used
 *
 * @param array Array to convert
 * @param key Key to use for grouping
 * @param value Callback to get an item's value
 * @returns _Map_ of keyed values
 *
 * @example
 * ```typescript
 * toMap(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   'value',
 *   item => item.id,
 * ); // => Map { 10 => 3, 20 => 2 }
 * ```
 */
export function toMap<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], key: ItemKey, value: ValueCallback): Map<Item[ItemKey], ReturnType<ValueCallback>>;

/**
 * Create a _Map_ from an array of items using a key and value
 *
 * If multiple items have the same key, the latest item's value will be used
 *
 * @param array Array to convert
 * @param key Key to use for grouping
 * @param value Key to use for value
 * @returns _Map_ of keyed values
 *
 * @example
 * ```typescript
 * toMap(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   'value',
 *   'id',
 * ); // => Map { 10 => 3, 20 => 2 }
 * ```
 */
export function toMap<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ItemValue extends keyof Item,
>(array: Item[], key: ItemKey, value: ItemValue): Map<Item[ItemKey], Item[ItemValue]>;

/**
 * Create a _Map_ from an array of items using a callback
 *
 * If multiple items have the same key, the latest item will be used
 *
 * @param array Array to convert
 * @param callback Callback to get an item's grouping key
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
export function toMap<Item, Callback extends (item: Item, index: number, array: Item[]) => Key>(
	array: Item[],
	callback: Callback,
): Map<ReturnType<Callback>, Item>;

/**
 * Create a _Map_ from an array of items using a key
 *
 * If multiple items have the same key, the latest item will be used
 *
 * @param array Array to convert
 * @param key Key to use for grouping
 * @returns _Map_ of keyed items
 *
 * @example
 * ```typescript
 * toMap(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   'value',
 * ); // => Map { 10 => {id: 3, value: 10}, 20 => {id: 2, value: 20} }
 * ```
 */
export function toMap<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
): Map<Item[ItemKey], Item>;

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

toMap.arrays = toMapArrays;

/**
 * Create a _Map_ from an array of items using callbacks, grouping values into arrays
 *
 * _Available as `toMapArrays` and `toMap.arrays`_
 *
 * @param array Array to convert
 * @param key Callback to get an item's grouping key
 * @param value Callback to get an item's value
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
	KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
	ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: KeyCallback,
	value: ValueCallback,
): Map<ReturnType<KeyCallback>, ReturnType<ValueCallback>[]>;

/**
 * Create a _Map_ from an array of items using a callback and value, grouping values into arrays
 *
 * _Available as `toMapArrays` and `toMap.arrays`_
 *
 * @param array Array to convert
 * @param key Callback to get an item's grouping key
 * @param value Key to use for value
 * @returns _Map_ of keyed arrays of values
 *
 * @example
 * ```typescript
 * toMapArrays(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   item => item.value,
 *   'id',
 * ); // => Map { 10 => [1, 3], 20 => [2] }
 * ```
 */
export function toMapArrays<
	Item extends PlainObject,
	KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends keyof Item,
>(
	array: Item[],
	key: KeyCallback,
	value: ItemValue,
): Map<ReturnType<KeyCallback>, Item[ItemValue][]>;

/**
 * Create a _Map_ from an array of items using a key and callback, grouping values into arrays
 *
 * _Available as `toMapArrays` and `toMap.arrays`_
 *
 * @param array Array to convert
 * @param key Key to use for grouping
 * @param value Callback to get an item's value
 * @returns _Map_ of keyed arrays of values
 *
 * @example
 * ```typescript
 * toMapArrays(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   'value',
 *   item => item.id,
 * ); // => Map { 10 => [1, 3], 20 => [2] }
 * ```
 */
export function toMapArrays<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	value: ValueCallback,
): Map<Item[ItemKey], ReturnType<ValueCallback>[]>;

/**
 * Create a _Map_ from an array of items using a key and value, grouping values into arrays
 *
 * _Available as `toMapArrays` and `toMap.arrays`_
 *
 * @param array Array to convert
 * @param key Key to use for grouping
 * @param value Key to use for value
 * @returns _Map_ of keyed arrays of values
 *
 * @example
 * ```typescript
 * toMapArrays(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   'value',
 *   'id',
 * ); // => Map { 10 => [1, 3], 20 => [2] }
 * ```
 */
export function toMapArrays<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ItemValue extends keyof Item,
>(array: Item[], key: ItemKey, value: ItemValue): Map<Item[ItemKey], Item[ItemValue][]>;

/**
 * Create a _Map_ from an array of items using a callback, grouping items into arrays
 *
 * _Available as `toMapArrays` and `toMap.arrays`_
 *
 * @param array Array to convert
 * @param callback Callback to get an item's grouping key
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
export function toMapArrays<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], callback: Callback): Map<ReturnType<Callback>, Item[]>;

/**
 * Create a _Map_ from an array of items using a key, grouping items into arrays
 *
 * _Available as `toMapArrays` and `toMap.arrays`_
 *
 * @param array Array to convert
 * @param key Key to use for grouping
 * @returns _Map_ of keyed arrays of items
 *
 * @example
 * ```typescript
 * toMapArrays(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   'value',
 * ); // => Map { 10 => [{id: 1, value: 10}, {id: 3, value: 10}], 20 => [{id: 2, value: 20}] }
 * ```
 */
export function toMapArrays<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
): Map<Item[ItemKey], Item[]>;

export function toMapArrays(array: unknown[], first?: unknown, second?: unknown): unknown {
	return getMapValues(array, first, second, true);
}

// #endregion
