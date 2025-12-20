import {groupValues} from '../internal/array/group';
import type {Key, KeyedValue, PlainObject, Simplify} from '../models';

type GroupBy = {
	/**
	 * Create a record from an array of items using a specific key and value
	 *
	 * If multiple items have the same key, the latest item's value will be used
	 * @param array Array to group
	 * @param key Callback to get an item's grouping key
	 * @param value Callback to get an item's value
	 * @returns Record of keyed values
	 */
	<
		Item,
		KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
		ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: KeyCallback,
		value: ValueCallback,
	): Simplify<Record<ReturnType<KeyCallback>, ReturnType<ValueCallback>>>;

	/**
	 * Create a record from an array of items using a specific key and value
	 *
	 * If multiple items have the same key, the latest item's value will be used
	 * @param array Array to group
	 * @param key Callback to get an item's grouping key
	 * @param value Key to use for value
	 * @returns Record of keyed values
	 */
	<
		Item extends PlainObject,
		KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
		ItemValue extends keyof Item,
	>(
		array: Item[],
		key: KeyCallback,
		value: ItemValue,
	): Record<ReturnType<KeyCallback>, Item[ItemValue]>;

	/**
	 * Create a record from an array of items using a specific key and value
	 *
	 * If multiple items have the same key, the latest item's value will be used
	 * @param array Array to group
	 * @param key Key to use for grouping
	 * @param value Callback to get an item's value
	 * @returns Record of keyed values
	 */
	<
		Item extends PlainObject,
		ItemKey extends keyof Item,
		ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: ItemKey,
		value: ValueCallback,
	): Simplify<Record<KeyedValue<Item, ItemKey>, ReturnType<ValueCallback>>>;

	/**
	 * Create a record from an array of items using a specific key and value
	 *
	 * If multiple items have the same key, the latest item's value will be used
	 * @param array Array to group
	 * @param key Key to use for grouping
	 * @param value Key to use for value
	 * @returns Record of keyed values
	 */
	<Item extends PlainObject, ItemKey extends keyof Item, ItemValue extends keyof Item>(
		array: Item[],
		key: ItemKey,
		value: ItemValue,
	): Simplify<Record<KeyedValue<Item, ItemKey>, Item[ItemValue]>>;

	/**
	 * Create a record from an array of items using a specific key
	 *
	 * If multiple items have the same key, the latest item will be used
	 * @param array Array to group
	 * @param callback Callback to get an item's grouping key
	 * @returns Record of keyed items
	 */
	<Item, Callback extends (item: Item, index: number, array: Item[]) => Key>(
		array: Item[],
		callback: Callback,
	): Record<ReturnType<Callback>, Item>;

	/**
	 * Create a record from an array of items using a specific key
	 *
	 * If multiple items have the same key, the latest item will be used
	 * @param array Array to group
	 * @param key Key to use for grouping
	 * @returns Record of keyed items
	 */
	<Item extends PlainObject, ItemKey extends keyof Item>(
		array: Item[],
		key: ItemKey,
	): Simplify<Record<KeyedValue<Item, ItemKey>, Item>>;

	/**
	 * Create a record from an array of items _(using indices as keys)_
	 * @param array Array to group
	 * @returns Record of indiced items
	 */
	<Item>(array: Item[]): Record<number, Item>;

	/**
	 * Create a record from an array of items using a specific key and value, grouping values into arrays
	 * @param array Array to group
	 * @param key Callback to get an item's grouping key
	 * @param value Callback to get an item's value
	 * @returns Record of keyed values
	 */
	arrays<
		Item,
		KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
		ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: KeyCallback,
		value: ValueCallback,
	): Record<ReturnType<KeyCallback>, ReturnType<ValueCallback>[]>;

	/**
	 * Create a record from an array of items using a specific key and value, grouping values into arrays
	 * @param array Array to group
	 * @param key Callback to get an item's grouping key
	 * @param value Key to use for value
	 * @returns Record of keyed values
	 */
	arrays<
		Item extends PlainObject,
		KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
		ItemValue extends keyof Item,
	>(
		array: Item[],
		key: KeyCallback,
		value: ItemValue,
	): Record<ReturnType<KeyCallback>, Item[ItemValue][]>;

	/**
	 * Create a record from an array of items using a specific key and value, grouping values into arrays
	 * @param array Array to group
	 * @param key Key to use for grouping
	 * @param value Callback to get an item's value
	 * @returns Record of keyed values
	 */
	arrays<
		Item extends PlainObject,
		ItemKey extends keyof Item,
		ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: ItemKey,
		value: ValueCallback,
	): Simplify<Record<KeyedValue<Item, ItemKey>, ReturnType<ValueCallback>[]>>;

	/**
	 * Create a record from an array of items using a specific key and value, grouping values into arrays
	 * @param array Array to group
	 * @param key Key to use for grouping
	 * @param value Key to use for value
	 * @returns Record of keyed values
	 */
	arrays<Item extends PlainObject, ItemKey extends keyof Item, ItemValue extends keyof Item>(
		array: Item[],
		key: ItemKey,
		value: ItemValue,
	): Simplify<Record<KeyedValue<Item, ItemKey>, Item[ItemValue][]>>;

	/**
	 * Create a record from an array of items using a specific key, grouping items into arrays
	 * @param array Array to group
	 * @param callback Callback to get an item's grouping key
	 * @returns Record of keyed items
	 */
	arrays<Item, Callback extends (item: Item, index: number, array: Item[]) => Key>(
		array: Item[],
		callback: Callback,
	): Record<ReturnType<Callback>, Item[]>;

	/**
	 * Create a record from an array of items using a specific key, grouping items into arrays
	 * @param array Array to group
	 * @param key Key to use for grouping
	 * @returns Record of keyed items
	 */
	arrays<Item extends PlainObject, ItemKey extends keyof Item>(
		array: Item[],
		key: ItemKey,
	): Simplify<Record<KeyedValue<Item, ItemKey>, Item[]>>;
};

const groupBy = ((array: unknown[], first: unknown, second: unknown) =>
	groupValues(array, first, second, false)) as GroupBy;

groupBy.arrays = ((array: unknown[], first: unknown, second: unknown): unknown =>
	groupValues(array, first, second, true) as never) as GroupBy['arrays'];

export {groupBy};
