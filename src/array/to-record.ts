import type {Simplify} from 'type-fest';
import {groupValues} from '../internal/array/group';
import type {Key, KeyedValue, PlainObject} from '../models';

type ToRecord = {
	/**
	 * Create a record from an array of items, using their indices as keys
	 * @param array Array to convert
	 * @returns Record with indices as keys and items as values
	 */
	<Item>(array: Item[]): Record<number, Item>;

	/**
	 * Create a record from an array of items using a key
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @returns Record with keys, holding the latest matching item
	 */
	<Item extends PlainObject, ItemKey extends keyof Item>(
		array: Item[],
		key: ItemKey,
	): Simplify<Record<KeyedValue<Item, ItemKey>, Item>>;

	/**
	 * Create a record from an array of items using a callback
	 * @param array Array to convert
	 * @param callback Function to get a key from each item
	 * @returns Record with keys, holding the latest matching item
	 */
	<Item, Callback extends (item: Item, index: number, array: Item[]) => Key>(
		array: Item[],
		callback: Callback,
	): Record<ReturnType<Callback>, Item>;

	/**
	 * Create a record from an array of items using a key and value
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @param value Key to use for value
	 * @returns Record with keys, holding the latest matching item's value
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
	 * Create a record from an array of items using a key and callback
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @param callback Function to get a value from each item
	 * @returns Record with keys, holding the latest matching item's value
	 */
	<
		Item extends PlainObject,
		ItemKey extends keyof Item,
		Callback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: ItemKey,
		callback: Callback,
	): Simplify<Record<KeyedValue<Item, ItemKey>, ReturnType<Callback>>>;

	/**
	 * Create a record from an array of items using a callback and value
	 * @param array Array to convert
	 * @param callback Function to get a key from each item
	 * @param value Key to use for value
	 * @returns Record with keys, holding the latest matching item's value
	 */
	<
		Item extends PlainObject,
		Callback extends (item: Item, index: number, array: Item[]) => Key,
		ItemValue extends keyof Item,
	>(
		array: Item[],
		callback: Callback,
		value: ItemValue,
	): Record<ReturnType<Callback>, Item[ItemValue]>;

	/**
	 * Create a record from an array of items using callbacks
	 * @param array Array to convert
	 * @param key Function to get a key from each item
	 * @param value Function to get a value from each item
	 * @returns Record with keys, holding the latest matching item's value
	 */
	<
		Item,
		KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
		ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: KeyCallback,
		value: ValueCallback,
	): Record<ReturnType<KeyCallback>, ReturnType<ValueCallback>>;

	/**
	 * Create a record from an array of items using a key, and grouping them into arrays
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @returns Record with keys, holding arrays of items
	 */
	arrays<Item extends PlainObject, ItemKey extends keyof Item>(
		array: Item[],
		key: ItemKey,
	): Simplify<Record<KeyedValue<Item, ItemKey>, Item[]>>;

	/**
	 * Create a record from an array of items using a callback, and grouping them into arrays
	 * @param array Array to convert
	 * @param callback Function to get a key from each item
	 * @returns Record with keys, holding arrays of items
	 */
	arrays<
		Item,
		Callback extends (item: Item, index: number, array: Item[]) => Key,
	>(array: Item[], callback: Callback): Record<ReturnType<Callback>, Item[]>;

	/**
	 * Create a record from an array of items using a key and value, and grouping them into arrays
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @param value Key to use for value
	 * @returns Record with keys, holding arrays of items' values
	 */
	arrays<
		Item extends PlainObject,
		ItemKey extends keyof Item,
		ItemValue extends keyof Item,
	>(
		array: Item[],
		key: ItemKey,
		value: ItemValue,
	): Simplify<Record<KeyedValue<Item, ItemKey>, Array<Item[ItemValue]>>>;

	/**
	 * Create a record from an array of items using a key and callback, and grouping them into arrays
	 * @param array Array to convert
	 * @param key Key to use for grouping
	 * @param callback Function to get a value from each item
	 * @returns Record with keys, holding arrays of items' values
	 */
	arrays<
		Item extends PlainObject,
		ItemKey extends keyof Item,
		Callback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: ItemKey,
		callback: Callback,
	): Simplify<Record<KeyedValue<Item, ItemKey>, Array<ReturnType<Callback>>>>;

	/**
	 * Create a record from an array of items using a callback and value, and grouping them into arrays
	 * @param array Array to convert
	 * @param callback Function to get a key from each item
	 * @param value Key to use for value
	 * @returns Record with keys, holding arrays of items' values
	 */
	arrays<
		Item extends PlainObject,
		Callback extends (item: Item, index: number, array: Item[]) => Key,
		ItemValue extends keyof Item,
	>(
		array: Item[],
		callback: Callback,
		value: ItemValue,
	): Record<ReturnType<Callback>, Array<Item[ItemValue]>>;

	/**
	 * Create a record from an array of items using callbacks, and grouping them into arrays
	 * @param array Array to convert
	 * @param key Function to get a key from each item
	 * @param value Function to get a value from each item
	 * @returns Record with keys, holding arrays of items' values
	 */
	arrays<
		Item,
		KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
		ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: KeyCallback,
		value: ValueCallback,
	): Record<ReturnType<KeyCallback>, Array<ReturnType<ValueCallback>>>;
};

const toRecord: ToRecord = ((
	array: unknown[],
	first: unknown,
	second: unknown,
) => groupValues(array, first, second, false)) as ToRecord;

toRecord.arrays = ((array: unknown[], first: unknown, second: unknown) =>
	groupValues(array, first, second, true)) as ToRecord['arrays'];

export {toRecord};
