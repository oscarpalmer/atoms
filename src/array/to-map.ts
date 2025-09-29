import {getCallbacks} from '../internal/array/callbacks';
import type {Key, PlainObject} from '../models';

type ToMap = {
	/**
	 * Create a Map from an array of items _(using indices as keys)_
	 * @param array Array to convert
	 * @returns Map of indiced items
	 */
	<Item>(array: Item[]): Map<number, Item>;

	/**
	 * Create a Map from an array of items using a key
	 * 
	 * If multiple items have the same key, the latest item will be used
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @returns Map of keyed items
	 */
	<Item extends PlainObject, ItemKey extends keyof Item>(
		array: Item[],
		key: ItemKey,
	): Map<Item[ItemKey], Item>;

	/**
	 * Create a Map from an array of items using a callback
	 * 
	 * If multiple items have the same key, the latest item will be used
	 * @param array Array to convert
	 * @param callback Callback to get an item's grouping key
	 * @returns Map of keyed items
	 */
	<Item, Callback extends (item: Item, index: number, array: Item[]) => Key>(
		array: Item[],
		callback: Callback,
	): Map<ReturnType<Callback>, Item>;

	/**
	 * Create a Map from an array of items using a key and value
	 * 
	 * If multiple items have the same key, the latest item's value will be used
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @param value Key to use for value
	 * @returns Map of keyed values
	 */
	<
		Item extends PlainObject,
		ItemKey extends keyof Item,
		ItemValue extends keyof Item,
	>(
		array: Item[],
		key: ItemKey,
		value: ItemValue,
	): Map<Item[ItemKey], Item[ItemValue]>;

	/**
	 * Create a Map from an array of items using a key and callback
	 * 
	 * If multiple items have the same key, the latest item's value will be used
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @param value Callback to get an item's value
	 * @returns Map of keyed values
	 */
	<
		Item extends PlainObject,
		ItemKey extends keyof Item,
		ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: ItemKey,
		value: ValueCallback,
	): Map<Item[ItemKey], ReturnType<ValueCallback>>;

	/**
	 * Create a Map from an array of items using a callback and value
	 * 
	 * If multiple items have the same key, the latest item's value will be used
	 * @param array Array to convert
	 * @param key Callback to get an item's grouping key
	 * @param value Key to use for value
	 * @returns Map of keyed values
	 */
	<
		Item extends PlainObject,
		KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
		ItemValue extends keyof Item,
	>(
		array: Item[],
		key: KeyCallback,
		value: ItemValue,
	): Map<ReturnType<KeyCallback>, Item[ItemValue]>;

	/**
	 * Create a Map from an array of items using callbacks
	 * 
	 * If multiple items have the same key, the latest item's value will be used
	 * @param array Array to convert
	 * @param key Callback to get an item's grouping key
	 * @param value Callback to get an item's value
	 * @returns Map of keyed values
	 */
	<
		Item,
		KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
		ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: KeyCallback,
		value: ValueCallback,
	): Map<ReturnType<KeyCallback>, ReturnType<ValueCallback>>;

	/**
	 * Create a Map from an array of items using a key, grouping items into arrays
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @returns Map of keyed arrays of items
	 */
	arrays<Item extends PlainObject, ItemKey extends keyof Item>(
		array: Item[],
		key: ItemKey,
	): Map<Item[ItemKey], Item[]>;

	/**
	 * Create a Map from an array of items using a callback, grouping items into arrays
	 * @param array Array to convert
	 * @param callback Callback to get an item's grouping key
	 * @returns Map of keyed arrays of items
	 */
	arrays<
		Item,
		Callback extends (item: Item, index: number, array: Item[]) => Key,
	>(array: Item[], callback: Callback): Map<ReturnType<Callback>, Item[]>;

	/**
	 * Create a Map from an array of items using a key and value, grouping values into arrays
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @param value Key to use for value
	 * @returns Map of keyed arrays of values
	 */
	arrays<
		Item extends PlainObject,
		ItemKey extends keyof Item,
		ItemValue extends keyof Item,
	>(
		array: Item[],
		key: ItemKey,
		value: ItemValue,
	): Map<Item[ItemKey], Item[ItemValue][]>;

	/**
	 * Create a Map from an array of items using a key and callback, grouping values into arrays
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @param value Callback to get an item's value
	 * @returns Map of keyed arrays of values
	 */
	arrays<
		Item extends PlainObject,
		ItemKey extends keyof Item,
		ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: ItemKey,
		value: ValueCallback,
	): Map<Item[ItemKey], ReturnType<ValueCallback>[]>;

	/**
	 * Create a Map from an array of items using a callback and value, grouping values into arrays
	 * @param array Array to convert
	 * @param key Callback to get an item's grouping key
	 * @param value Key to use for value
	 * @returns Map of keyed arrays of values
	 */
	arrays<
		Item extends PlainObject,
		KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
		ItemValue extends keyof Item,
	>(
		array: Item[],
		key: KeyCallback,
		value: ItemValue,
	): Map<ReturnType<KeyCallback>, Item[ItemValue][]>;

	/**
	 * Create a Map from an array of items using callbacks, grouping values into arrays
	 * @param array Array to convert
	 * @param key Callback to get an item's grouping key
	 * @param value Callback to get an item's value
	 * @returns Map of keyed arrays of values
	 */
	arrays<
		Item,
		KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
		ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: KeyCallback,
		value: ValueCallback,
	): Map<ReturnType<KeyCallback>, ReturnType<ValueCallback>[]>;
};

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
	const callbacks = getCallbacks(undefined, first, second);
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

const toMap: ToMap = ((
	array: unknown[],
	first: unknown,
	second: unknown,
	arrays: boolean,
): unknown => getMapValues(array, first, second, arrays)) as ToMap;

toMap.arrays = ((array: unknown[], first: unknown, second: unknown) =>
	getMapValues(array, first, second, true)) as ToMap['arrays'];

export {toMap};
