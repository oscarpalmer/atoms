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

export function groupValues(
	array: unknown[],
	key: unknown,
	value: unknown,
	arrays: boolean,
): Record<Key, unknown> {
	if (!Array.isArray(array) || array.length === 0) {
		return {};
	}

	const callbacks = getCallbacks(undefined, key, value);
	const record: Record<Key, unknown> = {};
	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		const keyed = callbacks?.key?.(item, index, array) ?? index;
		const valued = callbacks?.value?.(item, index, array) ?? item;

		if (arrays) {
			const existing = record[keyed];

			if (existing == null) {
				record[keyed] = [valued];
			} else {
				(existing as unknown[]).push(valued);
			}
		} else {
			record[keyed] = valued;
		}
	}

	return record;
}
