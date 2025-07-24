import type {Simplify} from 'type-fest';
import {groupValues} from '../internal/array/group';
import type {Key, KeyedValue, PlainObject} from '../models';

/**
 * Create a record from an array of items using a specific key
 * @param array Array to group
 * @param key Key to use for grouping
 * @returns Record grouped by keyed values, holding the latest matching item
 */
export function groupBy<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
): Simplify<Record<KeyedValue<Item, ItemKey>, Item>>;

/**
 * Create a record from an array of items using a specific key, and grouping them into arrays
 * @param array Array to group
 * @param key Key to use for grouping
 * @param arrays Group the values into arrays
 * @returns Record grouped by keyed values, holding arrays of items
 */
export function groupBy<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	arrays: true,
): Simplify<Record<KeyedValue<Item, ItemKey>, Item[]>>;

/**
 * Create a record from an array of items using a specific key
 * @param array Array to group
 * @param callback Function to get a grouping value from each item
 * @returns Record grouped by keyed values, holding the latest matching item
 */
export function groupBy<
		Item,
		Callback extends (item: Item, index: number, array: Item[]) => Key,
	>(array: Item[], callback: Callback): Record<ReturnType<Callback>, Item>;

/**
 * Create a record from an array of items using a specific key, and grouping them into arrays
 * @param array Array to group
 * @param callback Function to get a grouping value from each item
 * @param arrays Group the values into arrays
 * @returns Record grouped by keyed values, holding arrays of items
 */
export function groupBy<
		Item,
		Callback extends (item: Item, index: number, array: Item[]) => Key,
	>(
		array: Item[],
		callback: Callback,
		arrays: true,
	): Record<ReturnType<Callback>, Item[]>;

/**
 * Create a record from an array of items using a specific key and value
 * @param array Array to group
 * @param key Key to use for grouping
 * @param value Key to use for value
 * @returns Record grouped by keyed values, holding the latest matching item's value
 */
export function groupBy<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ItemValue extends keyof Item,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
): Simplify<Record<KeyedValue<Item, ItemKey>, Item[ItemValue]>>;

/**
 * Create a record from an array of items using a specific key and value, and grouping them into arrays
 * @param array Array to group
 * @param key Key to use for grouping
 * @param value Key to use for value
 * @param arrays Group the values into arrays
 * @returns Record grouped by keyed values, holding arrays of values
 */
export function groupBy<
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
 * Create a record from an array of items using a specific key and value
 * @param array Array to group
 * @param key Key to use for grouping
 * @param value Function to get a value from each item
 * @returns Record grouped by keyed values, holding the latest matching item's value
 */
export function groupBy<
		Item extends PlainObject,
		ItemKey extends keyof Item,
		ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: ItemKey,
		value: ValueCallback,
	): Simplify<Record<KeyedValue<Item, ItemKey>, ReturnType<ValueCallback>>>;

/**
 * Create a record from an array of items using a specific key and value, and grouping them into arrays
 * @param array Array to group
 * @param key Key to use for grouping
 * @param value Function to get a value from each item
 * @param arrays Group the values into arrays
 * @returns Record grouped by keyed values, holding arrays of values
 */
export function groupBy<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	value: ValueCallback,
	arrays: true,
): Simplify<
	Record<KeyedValue<Item, ItemKey>, Array<ReturnType<ValueCallback>>>
>;

/**
 * Create a record from an array of items using a specific key and value
 * @param array Array to group
 * @param key Function to get a grouping value from each item
 * @param value Key to use for value
 * @returns Record grouped by keyed values, holding the latest matching item's value
 */
export function groupBy<
		Item extends PlainObject,
		KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
		ItemValue extends keyof Item,
	>(
		array: Item[],
		key: KeyCallback,
		value: ItemValue,
	): Record<ReturnType<KeyCallback>, Item[ItemValue]>;

/**
 * Create a record from an array of items using a specific key and value, and grouping them into arrays
 * @param array Array to group
 * @param key Function to get a grouping value from each item
 * @param value Key to use for value
 * @param arrays Group the values into arrays
 * @returns Record grouped by keyed values, holding arrays of values
 */
export function groupBy<
		Item extends PlainObject,
		KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
		ItemValue extends keyof Item,
	>(
		array: Item[],
		key: KeyCallback,
		value: ItemValue,
		arrays: true,
	): Record<ReturnType<KeyCallback>, Array<Item[ItemValue]>>;

/**
 * Create a record from an array of items using a specific key and value
 * @param array Array to group
 * @param key Function to get a grouping value from each item
 * @param value Function to get a value from each item
 * @returns Record grouped by keyed values, holding the latest matching item's value
 */
export function groupBy<
		Item,
		KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
		ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: KeyCallback,
		value: ValueCallback,
	): Simplify<Record<ReturnType<KeyCallback>, ReturnType<ValueCallback>>>;

/**
 * Create a record from an array of items using a specific key and value, and grouping them into arrays
 * @param array Array to group
 * @param key Function to get a grouping value from each item
 * @param value Function to get a value from each item
 * @param arrays Group the values into arrays
 * @returns Record grouped by keyed values, holding arrays of values
 */
export function groupBy<
		Item,
		KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
		ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
	>(
		array: Item[],
		key: KeyCallback,
		value: ValueCallback,
		arrays: true,
	): Record<ReturnType<KeyCallback>, Array<ReturnType<ValueCallback>>>;

export function groupBy(
	array: unknown[],
	key?: boolean,
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
