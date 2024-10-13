import {groupValues} from '~/array/group-by';
import type {KeyCallback, ValueCallback} from '~/array/models';
import type {KeyedValue, PlainObject} from '~/models';

/**
 * Create a record from an array of items _(using their indices as keys)_
 */
export function toRecord<Item>(array: Item[]): Record<number, Item>;

/**
 * Create a record from an array of items using a specific key
 */
export function toRecord<Item, Key extends keyof Item>(
	array: Item[],
	key: Key,
): Record<KeyedValue<Item, Key>, Item>;

/**
 * Create a record from an array of items using a specific key, and grouping them into arrays
 */
export function toRecord<Item, Key extends keyof Item>(
	array: Item[],
	key: Key,
	arrays: true,
): Record<KeyedValue<Item, Key>, Item[]>;

/**
 * Create a record from an array of items using a specific key
 */
export function toRecord<Item, Key extends KeyCallback<Item>>(
	array: Item[],
	key: Key,
): Record<ReturnType<Key>, Item>;

/**
 * Create a record from an array of items using a specific key, and grouping them into arrays
 */
export function toRecord<Item, Key extends KeyCallback<Item>>(
	array: Item[],
	key: Key,
	arrays: true,
): Record<ReturnType<Key>, Item[]>;

/**
 * Create a record from an array of items using a specific key and value
 */
export function toRecord<
	Item,
	Key extends keyof Item,
	Value extends keyof Item,
>(
	array: Item[],
	key: Key,
	value: Value,
): Record<KeyedValue<Item, Key>, KeyedValue<Item, Value>>;

/**
 * Create a record from an array of items using a specific key and value, and grouping them into arrays
 */
export function toRecord<
	Item,
	Key extends keyof Item,
	Value extends keyof Item,
>(
	array: Item[],
	key: Key,
	value: Value,
	arrays: true,
): Record<KeyedValue<Item, Key>, Array<KeyedValue<Item, Value>>>;

/**
 * Create a record from an array of items using a specific key and value
 */
export function toRecord<
	Item,
	Key extends keyof Item,
	Value extends ValueCallback<Item>,
>(
	array: Item[],
	key: Key,
	value: Value,
): Record<KeyedValue<Item, Key>, ReturnType<Value>>;

/**
 * Create a record from an array of items using a specific key and value, and grouping them into arrays
 */
export function toRecord<
	Item,
	Key extends keyof Item,
	Value extends ValueCallback<Item>,
>(
	array: Item[],
	key: Key,
	value: Value,
	arrays: true,
): Record<KeyedValue<Item, Key>, Array<ReturnType<Value>>>;

/**
 * Create a record from an array of items using a specific key and value
 */
export function toRecord<
	Item,
	Key extends KeyCallback<Item>,
	Value extends keyof Item,
>(
	array: Item[],
	key: Key,
	value: Value,
): Record<ReturnType<Key>, KeyedValue<Item, Value>>;

/**
 * Create a record from an array of items using a specific key and value, and grouping them into arrays
 */
export function toRecord<
	Item,
	Key extends KeyCallback<Item>,
	Value extends keyof Item,
>(
	array: Item[],
	key: Key,
	value: Value,
	arrays: true,
): Record<ReturnType<Key>, Array<KeyedValue<Item, Value>>>;

/**
 * Create a record from an array of items using a specific key and value
 */
export function toRecord<
	Item,
	Key extends KeyCallback<Item>,
	Value extends ValueCallback<Item>,
>(
	array: Item[],
	key: Key,
	value: Value,
): Record<ReturnType<Key>, ReturnType<Value>>;

/**
 * Create a record from an array of items using a specific key and value, and grouping them into arrays
 */
export function toRecord<
	Item,
	Key extends KeyCallback<Item>,
	Value extends ValueCallback<Item>,
>(
	array: Item[],
	key: Key,
	value: Value,
	arrays: true,
): Record<ReturnType<Key>, Array<ReturnType<Value>>>;

export function toRecord(
	array: unknown[],
	first?: unknown,
	second?: unknown,
	third?: unknown,
): PlainObject {
	return groupValues(
		array,
		first as never,
		second,
		first === true || second === true || third === true,
	);
}
