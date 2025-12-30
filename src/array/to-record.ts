import {groupValues} from '../internal/array/group';
import type {Key, KeyedValue, PlainObject, Simplify} from '../models';

/**
 * Create a record from an array of items using callbacks
 *
 * If multiple items have the same key, the latest item will be used
 * @param array Array to convert
 * @param key Callback to get an item's grouping key
 * @param value Callback to get an item's value
 * @returns Record of keyed values
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
 * Create a record from an array of items using a callback and value
 *
 * If multiple items have the same key, the latest item will be used
 * @param array Array to convert
 * @param callback Callback to get an item's grouping key
 * @param value Key to use for value
 * @returns Record with keys
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
 * Create a record from an array of items using a key and callback
 *
 * If multiple items have the same key, the latest item will be used
 * @param array Array to convert
 * @param key Key to use for grouping
 * @param callback Callback to get an item's value
 * @returns Record with keys
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
 * Create a record from an array of items using a key and value
 *
 * If multiple items have the same key, the latest item will be used
 * @param array Array to convert
 * @param key Key to use for grouping
 * @param value Key to use for value
 * @returns Record of keyed values
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
 * Create a record from an array of items using a callback
 *
 * If multiple items have the same key, the latest item will be used
 * @param array Array to convert
 * @param callback Callback to get an item's grouping key
 * @returns Record of keyed values
 */
export function toRecord<Item, Callback extends (item: Item, index: number, array: Item[]) => Key>(
	array: Item[],
	callback: Callback,
): Record<ReturnType<Callback>, Item>;

/**
 * Create a record from an array of items using a key
 *
 * If multiple items have the same key, the latest item will be used
 * @param array Array to convert
 * @param key Key to use for grouping
 * @returns Record of keyed values
 */
export function toRecord<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
): Simplify<Record<KeyedValue<Item, ItemKey>, Item>>;

/**
 * Create a record from an array of items _(using indices as keys)_
 * @param array Array to convert
 * @returns Record of indiced values
 */
export function toRecord<Item>(array: Item[]): Record<number, Item>;

export function toRecord(array: unknown[], first?: unknown, second?: unknown): unknown {
	return groupValues(array, first, second, false);
}

/**
 * Create a record from an array of items using callbacks, grouping values into arrays
 * @param array Array to convert
 * @param key Callback to get an item's grouping key
 * @param value Callback to get an item's value
 * @returns Record of keyed arrays of values
 */
export function toRecordArrays<
	Item,
	KeyCallback extends (item: Item, index: number, array: Item[]) => Key,
	ValueCallback extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: KeyCallback,
	value: ValueCallback,
): Record<ReturnType<KeyCallback>, ReturnType<ValueCallback>[]>;

/**
 * Create a record from an array of items using a callback and value, grouping values into arrays
 * @param array Array to convert
 * @param callback Callback to get an item's grouping key
 * @param value Key to use for value
 * @returns Record of keyed arrays of values
 */
export function toRecordArrays<
	Item extends PlainObject,
	Callback extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends keyof Item,
>(
	array: Item[],
	callback: Callback,
	value: ItemValue,
): Record<ReturnType<Callback>, Item[ItemValue][]>;

/**
 * Create a record from an array of items using a key and callback, grouping values into arrays
 * @param array Array to convert
 * @param key Key to use for grouping
 * @param callback Callback to get an item's value
 * @returns Record of keyed arrays of values
 */
export function toRecordArrays<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	callback: Callback,
): Simplify<Record<KeyedValue<Item, ItemKey>, ReturnType<Callback>[]>>;

/**
 * Create a record from an array of items using a key and value, grouping values into arrays
 * @param array Array to convert
 * @param key Key to use for grouping
 * @param value Key to use for value
 * @returns Record of keyed arrays of values
 */
export function toRecordArrays<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ItemValue extends keyof Item,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
): Simplify<Record<KeyedValue<Item, ItemKey>, Item[ItemValue][]>>;

/**
 * Create a record from an array of items using a callback, grouping items into arrays
 * @param array Array to convert
 * @param callback Callback to get an item's grouping key
 * @returns Record of keyed arrays of items
 */
export function toRecordArrays<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], callback: Callback): Record<ReturnType<Callback>, Item[]>;

/**
 * Create a record from an array of items using a key, grouping items into arrays
 * @param array Array to convert
 * @param key Key to use for grouping
 * @returns Record of keyed arrays of items
 */
export function toRecordArrays<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
): Simplify<Record<KeyedValue<Item, ItemKey>, Item[]>>;

export function toRecordArrays(array: unknown[], first?: unknown, second?: unknown): unknown {
	return groupValues(array, first, second, true);
}
