import type {Simplify} from 'type-fest';
import {groupValues} from '../internal/array/group';
import type {Key, KeyedValue, PlainObject} from '../models';

/**
 * Create a record from an array of items, using their indices as keys
 * @param array Array to convert
 * @returns Record with indices as keys and items as values
 */
export function toRecord<Item>(array: Item[]): Record<number, Item>;

/**
 * Create a record from an array of items using a key
 * @param array Array to convert
 * @param key Key to use for grouping
 * @returns Record with keys, holding the latest matching item
 */
export function toRecord<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
): Simplify<Record<KeyedValue<Item, ItemKey>, Item>>;

/**
 * Create a record from an array of items using a key, and grouping them into arrays
 * @param array Array to convert
 * @param key Key to use for grouping
 * @param arrays Group the values into arrays
 * @returns Record with keys, holding arrays of items
 */
export function toRecord<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	arrays: true,
): Simplify<Record<KeyedValue<Item, ItemKey>, Item[]>>;

/**
 * Create a record from an array of items using a callback
 * @param array Array to convert
 * @param callback Function to get a key from each item
 * @returns Record with keys, holding the latest matching item
 */
export function toRecord<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], callback: Callback): Record<ReturnType<Callback>, Item>;

/**
 * Create a record from an array of items using a callback, and grouping them into arrays
 * @param array Array to convert
 * @param callback Function to get a key from each item
 * @param arrays Group the values into arrays
 * @returns Record with keys, holding arrays of items
 */
export function toRecord<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => Key,
>(
	array: Item[],
	callback: Callback,
	arrays: true,
): Record<ReturnType<Callback>, Item[]>;

/**
 * Create a record from an array of items using a key and value
 * @param array Array to convert
 * @param key Key to use for grouping
 * @param value Key to use for value
 * @returns Record with keys, holding the latest matching item's value
 */
export function toRecord<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ItemValue extends keyof Item,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
): Simplify<Record<KeyedValue<Item, ItemKey>, Item[ItemValue]>>;

/**
 * Create a record from an array of items using a key and value, and grouping them into arrays
 * @param array Array to convert
 * @param key Key to use for grouping
 * @param value Key to use for value
 * @param arrays Group the values into arrays
 * @returns Record with keys, holding arrays of items' values
 */
export function toRecord<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ItemValue extends keyof Item,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
	arrays: true,
): Simplify<Record<KeyedValue<Item, ItemKey>, Array<Item[ItemValue]>>>;

/**
 * Create a record from an array of items using a key and callback
 * @param array Array to convert
 * @param key Key to use for grouping
 * @param callback Function to get a value from each item
 * @returns Record with keys, holding the latest matching item's value
 */
export function toRecord<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	callback: Callback,
): Simplify<Record<KeyedValue<Item, ItemKey>, ReturnType<Callback>>>;

/**
 * Create a record from an array of items using a key and callback, and grouping them into arrays
 * @param array Array to convert
 * @param key Key to use for grouping
 * @param callback Function to get a value from each item
 * @param arrays Group the values into arrays
 * @returns Record with keys, holding arrays of items' values
 */
export function toRecord<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	callback: Callback,
	arrays: true,
): Simplify<Record<KeyedValue<Item, ItemKey>, Array<ReturnType<Callback>>>>;

/**
 * Create a record from an array of items using a callback and value
 * @param array Array to convert
 * @param callback Function to get a key from each item
 * @param value Key to use for value
 * @returns Record with keys, holding the latest matching item's value
 */
export function toRecord<
	Item extends PlainObject,
	Callback extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends keyof Item,
>(
	array: Item[],
	callback: Callback,
	value: ItemValue,
): Record<ReturnType<Callback>, Item[ItemValue]>;

/**
 * Create a record from an array of items using a callback and value, and grouping them into arrays
 * @param array Array to convert
 * @param callback Function to get a key from each item
 * @param value Key to use for value
 * @param arrays Group the values into arrays
 * @returns Record with keys, holding arrays of items' values
 */
export function toRecord<
	Item extends PlainObject,
	Callback extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends keyof Item,
>(
	array: Item[],
	callback: Callback,
	value: ItemValue,
	arrays: true,
): Record<ReturnType<Callback>, Array<Item[ItemValue]>>;

/**
 * Create a record from an array of items using callbacks
 * @param array Array to convert
 * @param key Function to get a key from each item
 * @param value Function to get a value from each item
 * @returns Record with keys, holding the latest matching item's value
 */
export function toRecord<
	Item,
	KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
	ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: KeyCallback,
	value: ValueCallback,
): Record<ReturnType<KeyCallback>, ReturnType<ValueCallback>>;

/**
 * Create a record from an array of items using callbacks, and grouping them into arrays
 * @param array Array to convert
 * @param key Function to get a key from each item
 * @param value Function to get a value from each item
 * @param arrays Group the values into arrays
 * @returns Record with keys, holding arrays of items' values
 */
export function toRecord<
	Item,
	KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
	ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: KeyCallback,
	value: ValueCallback,
	arrays: true,
): Record<ReturnType<KeyCallback>, Array<ReturnType<ValueCallback>>>;

export function toRecord(
	array: unknown[],
	key?: unknown,
	valueOrArrays?: unknown,
	arrays?: boolean,
): PlainObject {
	return groupValues(
		array,
		key,
		valueOrArrays,
		key === true || valueOrArrays === true || arrays === true,
	);
}
