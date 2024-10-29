import {getCallbacks} from '~/internal/array/callbacks';
import type {Key, PlainObject} from '~/models';

/**
 * Create a map from an array of items _(using their indices as keys)_
 */
export function toMap<Item>(array: Item[]): Map<number, Item>;

/**
 * Create a map from an array of items using a specific key
 */
export function toMap<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
): Map<Item[ItemKey], Item>;

/**
 * Create a map from an array of items using a specific key, and grouping them into arrays
 */
export function toMap<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	arrays: true,
): Map<Item[ItemKey], Item[]>;

/**
 * Create a map from an array of items using a specific key
 */
export function toMap<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], key: ItemKey): Map<ReturnType<ItemKey>, Item>;

/**
 * Create a map from an array of items using a specific key, and grouping them into arrays
 */
export function toMap<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], key: ItemKey, arrays: true): Map<ReturnType<ItemKey>, Item[]>;

/**
 * Create a map from an array of items using a specific key and value
 */
export function toMap<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ItemValue extends keyof Item,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
): Map<Item[ItemKey], Item[ItemValue]>;

/**
 * Create a map from an array of items using a specific key and value, and grouping them into arrays
 */
export function toMap<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ItemValue extends keyof Item,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
	arrays: true,
): Map<Item[ItemKey], Array<Item[ItemValue]>>;

/**
 * Create a map from an array of items using a specific key and value
 */
export function toMap<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ItemValue extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
): Map<Item[ItemKey], ReturnType<ItemValue>>;

/**
 * Create a map from an array of items using a specific key and value, and grouping them into arrays
 */
export function toMap<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	ItemValue extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
	arrays: true,
): Map<Item[ItemKey], Array<ReturnType<ItemValue>>>;

/**
 * Create a map from an array of items using a specific key and value
 */
export function toMap<
	Item extends PlainObject,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends keyof Item,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
): Map<ReturnType<ItemKey>, Item[ItemValue]>;

/**
 * Create a map from an array of items using a specific key and value, and grouping them into arrays
 */
export function toMap<
	Item extends PlainObject,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends keyof Item,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
	arrays: true,
): Map<ReturnType<ItemKey>, Array<Item[ItemValue]>>;

/**
 * Create a map from an array of items using a specific key and value
 */
export function toMap<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
): Map<ReturnType<ItemKey>, ReturnType<ItemValue>>;

/**
 * Create a map from an array of items using a specific key and value, and grouping them into arrays
 */
export function toMap<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
	ItemValue extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: ItemKey,
	value: ItemValue,
	arrays: true,
): Map<ReturnType<ItemKey>, Array<ReturnType<ItemValue>>>;

export function toMap(
	array: unknown[],
	first?: unknown,
	second?: unknown,
	third?: unknown,
): Map<unknown, unknown> {
	const asArrays = first === true || second === true || third === true;
	const callbacks = getCallbacks(undefined, first, second);
	const map = new Map<Key, unknown>();
	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		const key = callbacks?.key?.(item, index, array) ?? index;
		const value = callbacks?.value?.(item, index, array) ?? item;

		if (asArrays) {
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
