import type {Simplify} from 'type-fest';
import {getCallbacks} from '../internal/array/callbacks';
import type {Key, KeyedValue, PlainObject} from '../models';

/**
 * Create a record from an array of items using a specific key
 */
export function groupBy<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
): Simplify<Record<KeyedValue<Item, ItemKey>, Item>>;

/**
 * Create a record from an array of items using a specific key, and grouping them into arrays
 */
export function groupBy<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	arrays: true,
): Simplify<Record<KeyedValue<Item, ItemKey>, Item[]>>;

/**
 * Create a record from an array of items using a specific key
 */
export function groupBy<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], key: ItemKey): Record<ReturnType<ItemKey>, Item>;

/**
 * Create a record from an array of items using a specific key, and grouping them into arrays
 */
export function groupBy<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
>(
	array: Item[],
	key: ItemKey,
	arrays: true,
): Record<ReturnType<ItemKey>, Item[]>;

/**
 * Create a record from an array of items using a specific key and value
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
 */
export function groupBy<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ItemValue extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
): Simplify<Record<KeyedValue<Item, ItemKey>, ReturnType<ItemValue>>>;

/**
 * Create a record from an array of items using a specific key and value, and grouping them into arrays
 */
export function groupBy<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ItemValue extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
	arrays: true,
): Simplify<Record<KeyedValue<Item, ItemKey>, Array<ReturnType<ItemValue>>>>;

/**
 * Create a record from an array of items using a specific key and value
 */
export function groupBy<
	Item extends PlainObject,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends keyof Item,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
): Record<ReturnType<ItemKey>, Item[ItemValue]>;

/**
 * Create a record from an array of items using a specific key and value, and grouping them into arrays
 */
export function groupBy<
	Item extends PlainObject,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends keyof Item,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
	arrays: true,
): Record<ReturnType<ItemKey>, Array<Item[ItemValue]>>;

/**
 * Create a record from an array of items using a specific key and value
 */
export function groupBy<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
): Simplify<Record<ReturnType<ItemKey>, ReturnType<ItemValue>>>;

/**
 * Create a record from an array of items using a specific key and value, and grouping them into arrays
 */
export function groupBy<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
	arrays: true,
): Record<ReturnType<ItemKey>, Array<ReturnType<ItemValue>>>;

export function groupBy(
	array: unknown[],
	first?: boolean,
	second?: unknown,
	third?: boolean,
): PlainObject {
	return groupValues(
		array,
		first,
		second,
		first === true || second === true || third === true,
	) as never;
}

export function groupValues(
	array: unknown[],
	key: unknown,
	value: unknown,
	arrays: boolean,
): Record<Key, unknown> {
	const callbacks = getCallbacks(undefined, key, value);
	const record: Record<Key, unknown> = {};
	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		const key = callbacks?.key?.(item, index, array) ?? index;
		const value = callbacks?.value?.(item, index, array) ?? item;

		if (arrays) {
			const existing = record[key];

			if (existing == null) {
				record[key] = [value];
			} else {
				(existing as unknown[]).push(value);
			}
		} else {
			record[key] = value;
		}
	}

	return record;
}
