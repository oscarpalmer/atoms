import type {Simplify} from 'type-fest';
import {groupValues} from '../internal/array/group';
import type {Key, KeyedValue, PlainObject} from '../models';

interface GroupBy {
	/**
	 * Create a record from an array of items using a specific key
	 * @param array Array to group
	 * @param key Key to use for grouping
	 * @returns Record grouped by keyed values, holding the latest matching item
	 */
	<Item extends PlainObject, ItemKey extends keyof Item>(
		array: Item[],
		key: ItemKey,
	): Simplify<Record<KeyedValue<Item, ItemKey>, Item>>;

	/**
	 * Create a record from an array of items using a specific key
	 * @param array Array to group
	 * @param callback Function to get a grouping value from each item
	 * @returns Record grouped by keyed values, holding the latest matching item
	 */
	<Item, Callback extends (item: Item, index: number, array: Item[]) => Key>(
		array: Item[],
		callback: Callback,
	): Record<ReturnType<Callback>, Item>;

	/**
	 * Create a record from an array of items using a specific key and value
	 * @param array Array to group
	 * @param key Key to use for grouping
	 * @param value Key to use for value
	 * @returns Record grouped by keyed values, holding the latest matching item's value
	 */
	<
		Item extends PlainObject,
		ItemKey extends keyof Item,
		ItemValue extends keyof Item,
	>(
		array: Item[],
		key: ItemKey,
		value: ItemValue,
	): Simplify<Record<KeyedValue<Item, ItemKey>, Item[ItemValue]>>;

	/**
	 * Create a record from an array of items using a specific key and value
	 * @param array Array to group
	 * @param key Key to use for grouping
	 * @param value Function to get a value from each item
	 * @returns Record grouped by keyed values, holding the latest matching item's value
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
	 * @param array Array to group
	 * @param key Function to get a grouping value from each item
	 * @param value Key to use for value
	 * @returns Record grouped by keyed values, holding the latest matching item's value
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
	 * @param array Array to group
	 * @param key Function to get a grouping value from each item
	 * @param value Function to get a value from each item
	 * @returns Record grouped by keyed values, holding the latest matching item's value
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
	 * Create a record from an array of items using a specific key, and grouping them into arrays
	 * @param array Array to group
	 * @param key Key to use for grouping
	 * @returns Record grouped by keyed values, holding arrays of items
	 */
	arrays<Item extends PlainObject, ItemKey extends keyof Item>(
		array: Item[],
		key: ItemKey,
	): Simplify<Record<KeyedValue<Item, ItemKey>, Item[]>>;

	/**
	 * Create a record from an array of items using a specific key, and grouping them into arrays
	 * @param array Array to group
	 * @param callback Function to get a grouping value from each item
	 * @returns Record grouped by keyed values, holding arrays of items
	 */
	arrays<
		Item,
		Callback extends (item: Item, index: number, array: Item[]) => Key,
	>(array: Item[], callback: Callback): Record<ReturnType<Callback>, Item[]>;

	/**
	 * Create a record from an array of items using a specific key and value, and grouping them into arrays
	 * @param array Array to group
	 * @param key Key to use for grouping
	 * @param value Key to use for value
	 * @returns Record grouped by keyed values, holding arrays of values
	 */
	arrays<
		Item extends PlainObject,
		ItemKey extends keyof Item,
		ItemValue extends keyof Item,
	>(
		array: Item[],
		key: ItemKey,
		value: ItemValue,
	): Simplify<Record<KeyedValue<Item, ItemKey>, Item[ItemValue][]>>;

	/**
	 * Create a record from an array of items using a specific key and value, and grouping them into arrays
	 * @param array Array to group
	 * @param key Key to use for grouping
	 * @param value Function to get a value from each item
	 * @returns Record grouped by keyed values, holding arrays of values
	 */
	arrays<
		Item extends PlainObject,
		ItemKey extends keyof Item,
		ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: ItemKey,
		value: ValueCallback,
	): Simplify<
		Record<KeyedValue<Item, ItemKey>, ReturnType<ValueCallback>[]>
	>;

	/**
	 * Create a record from an array of items using a specific key and value, and grouping them into arrays
	 * @param array Array to group
	 * @param key Function to get a grouping value from each item
	 * @param value Key to use for value
	 * @returns Record grouped by keyed values, holding arrays of values
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
	 * Create a record from an array of items using a specific key and value, and grouping them into arrays
	 * @param array Array to group
	 * @param key Function to get a grouping value from each item
	 * @param value Function to get a value from each item
	 * @returns Record grouped by keyed values, holding arrays of values
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
}

const groupBy = ((array: unknown[], first: unknown, second: unknown) =>
	groupValues(array, first, second, false)) as GroupBy;

groupBy.arrays = ((
	array: unknown[],
	first: unknown,
	second: unknown,
): unknown =>
	groupValues(array, first, second, true) as never) as GroupBy['arrays'];

export {groupBy};
