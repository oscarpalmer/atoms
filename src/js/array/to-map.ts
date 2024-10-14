import {getCallbacks} from '~/internal/array/callbacks';
import type {KeyedValue, Key as SimpleKey} from '~/models';

/**
 * Create a map from an array of items _(using their indices as keys)_
 */
export function toMap<Item>(array: Item[]): Map<number, Item>;

/**
 * Create a map from an array of items using a specific key
 */
export function toMap<Item, Key extends keyof Item>(
	array: Item[],
	key: Key,
): Map<KeyedValue<Item, Key>, Item>;

/**
 * Create a map from an array of items using a specific key, and grouping them into arrays
 */
export function toMap<Item, Key extends keyof Item>(
	array: Item[],
	key: Key,
	arrays: true,
): Map<KeyedValue<Item, Key>, Item[]>;

/**
 * Create a map from an array of items using a specific key
 */
export function toMap<
	Item,
	Key extends (item: Item, index: number, array: Item[]) => SimpleKey,
>(array: Item[], key: Key): Map<ReturnType<Key>, Item>;

/**
 * Create a map from an array of items using a specific key, and grouping them into arrays
 */
export function toMap<
	Item,
	Key extends (item: Item, index: number, array: Item[]) => SimpleKey,
>(array: Item[], key: Key, arrays: true): Map<ReturnType<Key>, Item[]>;

/**
 * Create a map from an array of items using a specific key and value
 */
export function toMap<Item, Key extends keyof Item, Value extends keyof Item>(
	array: Item[],
	key: Key,
	value: Value,
): Map<KeyedValue<Item, Key>, KeyedValue<Item, Value>>;

/**
 * Create a map from an array of items using a specific key and value, and grouping them into arrays
 */
export function toMap<Item, Key extends keyof Item, Value extends keyof Item>(
	array: Item[],
	key: Key,
	value: Value,
	arrays: true,
): Map<KeyedValue<Item, Key>, Array<KeyedValue<Item, Value>>>;

/**
 * Create a map from an array of items using a specific key and value
 */
export function toMap<
	Item,
	Key extends keyof Item,
	Value extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: Key,
	value: Value,
): Map<KeyedValue<Item, Key>, ReturnType<Value>>;

/**
 * Create a map from an array of items using a specific key and value, and grouping them into arrays
 */
export function toMap<
	Item,
	Key extends keyof Item,
	Value extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: Key,
	value: Value,
	arrays: true,
): Map<KeyedValue<Item, Key>, Array<ReturnType<Value>>>;

/**
 * Create a map from an array of items using a specific key and value
 */
export function toMap<
	Item,
	Key extends (item: Item, index: number, array: Item[]) => SimpleKey,
	Value extends keyof Item,
>(
	array: Item[],
	key: Key,
	value: Value,
): Map<ReturnType<Key>, KeyedValue<Item, Value>>;

/**
 * Create a map from an array of items using a specific key and value, and grouping them into arrays
 */
export function toMap<
	Item,
	Key extends (item: Item, index: number, array: Item[]) => SimpleKey,
	Value extends keyof Item,
>(
	array: Item[],
	key: Key,
	value: Value,
	arrays: true,
): Map<ReturnType<Key>, Array<KeyedValue<Item, Value>>>;

/**
 * Create a map from an array of items using a specific key and value
 */
export function toMap<
	Item,
	Key extends (item: Item, index: number, array: Item[]) => SimpleKey,
	Value extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: Key,
	value: Value,
): Map<ReturnType<Key>, ReturnType<Value>>;

/**
 * Create a map from an array of items using a specific key and value, and grouping them into arrays
 */
export function toMap<
	Item,
	Key extends (item: Item, index: number, array: Item[]) => SimpleKey,
	Value extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	key: Key,
	value: Value,
	arrays: true,
): Map<ReturnType<Key>, Array<ReturnType<Value>>>;

export function toMap(
	array: unknown[],
	first?: unknown,
	second?: unknown,
	third?: unknown,
): Map<SimpleKey, unknown> {
	const asArrays = first === true || second === true || third === true;
	const callbacks = getCallbacks(undefined, first, second);
	const map = new Map<SimpleKey, unknown>();
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
