import {getCallbacks} from '../internal/array/callbacks';
import type {Key, PlainObject} from '../models';

type ToMap = {
	/**
	 * Create a Map from an array of items, using their indices as keys
	 * @param array Array to convert
	 * @returns Map with indexes as keys and items as values
	 */
	<Item>(array: Item[]): Map<number, Item>;

	/**
	 * Create a Map from an array of items using a key
	 * @param array Array to convert
	 * @param key Key to use
	 * @returns Map with keys, holding the latest matching item
	 */
	<Item extends PlainObject, ItemKey extends keyof Item>(
		array: Item[],
		key: ItemKey,
	): Map<Item[ItemKey], Item>;

	/**
	 * Create a Map from an array of items using a callback
	 * @param array Array to convert
	 * @param callback Function to get a key from each item
	 * @returns Map with keys, holding the latest matching item
	 */
	<Item, Callback extends (item: Item, index: number, array: Item[]) => Key>(
		array: Item[],
		callback: Callback,
	): Map<ReturnType<Callback>, Item>;

	/**
	 * Create a Map from an array of items using a key and value
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @param value Key to use for value
	 * @returns Map with keys, holding the latest matching item's value
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
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @param value Function to get a value from each item
	 * @returns Map with keys, holding the latest matching item's value
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
	 * @param array Array to convert
	 * @param key Function to get a key from each item
	 * @param value Key to use for value
	 * @returns Map with keys, holding the latest matching item's value
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
	 * @param array Array to convert
	 * @param key Function to get a key from each item
	 * @param value Function to get a value from each item
	 * @returns Map with keys, holding the latest matching item's value
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
	 * Create a Map from an array of items using a key, and grouping them into arrays
	 * @param array Array to convert
	 * @param key Key to use
	 * @returns Map with keys, holding arrays of items
	 */
	arrays<Item extends PlainObject, ItemKey extends keyof Item>(
		array: Item[],
		key: ItemKey,
	): Map<Item[ItemKey], Item[]>;

	/**
	 * Create a Map from an array of items using a callback, and grouping them into arrays
	 * @param array Array to convert
	 * @param callback Function to get a key from each item
	 * @returns Map with keys, holding arrays of items
	 */
	arrays<
		Item,
		Callback extends (item: Item, index: number, array: Item[]) => Key,
	>(array: Item[], callback: Callback): Map<ReturnType<Callback>, Item[]>;

	/**
	 * Create a Map from an array of items using a key and value, and grouping them into arrays
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @param value Key to use for value
	 * @returns Map with keys, holding arrays of items' values
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
	 * Create a Map from an array of items using a key and callback, and grouping them into arrays
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @param value Function to get a value from each item
	 * @returns Map with keys, holding arrays of items' values
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
	 * Create a Map from an array of items using a callback and value, and grouping them into arrays
	 * @param array Array to convert
	 * @param key Function to get a key from each item
	 * @param value Key to use for value
	 * @returns Map with keys, holding arrays of items' values
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
	 * Create a Map from an array of items using callbacks, and grouping them into arrays
	 * @param array Array to convert
	 * @param key Function to get a key from each item
	 * @param value Function to get a value from each item
	 * @returns Map with keys, holding arrays of items' values
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
