import type {KeyCallback, ValueCallback} from '~/array/models';
import {getCallbacks} from '~/internal/array/callbacks';
import type {Key, KeyedValue, PlainObject} from '~/models';

/**
 * Create a record from an array of items using a specific key
 */
export function groupBy<Item, Key extends keyof Item>(
	array: Item[],
	key: Key,
): Record<KeyedValue<Item, Key>, Item>;

/**
 * Create a record from an array of items using a specific key, and grouping them into arrays
 */
export function groupBy<Item, Key extends keyof Item>(
	array: Item[],
	key: Key,
	arrays: true,
): Record<KeyedValue<Item, Key>, Item[]>;

/**
 * Create a record from an array of items using a specific key
 */
export function groupBy<Item, Key extends KeyCallback<Item>>(
	array: Item[],
	key: Key,
): Record<ReturnType<Key>, Item>;

/**
 * Create a record from an array of items using a specific key, and grouping them into arrays
 */
export function groupBy<Item, Key extends KeyCallback<Item>>(
	array: Item[],
	key: Key,
	arrays: true,
): Record<ReturnType<Key>, Item[]>;

/**
 * Create a record from an array of items using a specific key and value
 */
export function groupBy<Item, Key extends keyof Item, Value extends keyof Item>(
	array: Item[],
	key: Key,
	value: Value,
): Record<KeyedValue<Item, Key>, KeyedValue<Item, Value>>;

/**
 * Create a record from an array of items using a specific key and value, and grouping them into arrays
 */
export function groupBy<Item, Key extends keyof Item, Value extends keyof Item>(
	array: Item[],
	key: Key,
	value: Value,
	arrays: true,
): Record<KeyedValue<Item, Key>, Array<KeyedValue<Item, Value>>>;

/**
 * Create a record from an array of items using a specific key and value
 */
export function groupBy<
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
export function groupBy<
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
export function groupBy<
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
export function groupBy<
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
export function groupBy<
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
export function groupBy<
	Item,
	Key extends KeyCallback<Item>,
	Value extends ValueCallback<Item>,
>(
	array: Item[],
	key: Key,
	value: Value,
	arrays: true,
): Record<ReturnType<Key>, Array<ReturnType<Value>>>;

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
