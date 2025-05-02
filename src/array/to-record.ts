import type {Simplify} from 'type-fest';
import {groupValues} from '../internal/array/group';
import type {Key, KeyedValue, PlainObject} from '../models';

/**
 * Create a record from an array of items _(using their indices as keys)_
 */
export function toRecord<Item>(array: Item[]): Record<number, Item>;

/**
 * Create a record from an array of items using a specific key
 */
export function toRecord<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
): Simplify<Record<KeyedValue<Item, ItemKey>, Item>>;

/**
 * Create a record from an array of items using a specific key, and grouping them into arrays
 */
export function toRecord<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	arrays: true,
): Simplify<Record<KeyedValue<Item, ItemKey>, Item[]>>;

/**
 * Create a record from an array of items using a specific key
 */
export function toRecord<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], key: ItemKey): Record<ReturnType<ItemKey>, Item>;

/**
 * Create a record from an array of items using a specific key, and grouping them into arrays
 */
export function toRecord<
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
 * Create a record from an array of items using a specific key and value, and grouping them into arrays
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
 * Create a record from an array of items using a specific key and value
 */
export function toRecord<
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
export function toRecord<
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
export function toRecord<
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
export function toRecord<
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
export function toRecord<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
): Record<ReturnType<ItemKey>, ReturnType<ItemValue>>;

/**
 * Create a record from an array of items using a specific key and value, and grouping them into arrays
 */
export function toRecord<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
	arrays: true,
): Record<ReturnType<ItemKey>, Array<ReturnType<ItemValue>>>;

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
