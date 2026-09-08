import {groupValues} from '../internal/array/group';
import type {Key, KeyOrCallback, KeyOrCallbackKey, KeyOrCallbackValue, Simplify} from '../models';

// #region Functions

/**
 * Create a record from an array of items using a specific key
 *
 * If multiple items have the same key, the latest item will be used
 *
 * @param array Array to convert
 * @param key Callback or key to use for grouping
 * @param value Callback or key to use for value, defaulting to the item itself
 * @returns Record of keyed values
 *
 * @example
 * ```typescript
 * toRecord(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   item => item.value,
 *   item => item.id,
 * ); // => { 10: 3, 20: 2 }
 * ```
 */
export function toRecord<
	Item,
	KeyArg extends KeyOrCallback<Item, Key>,
	ValueArg extends KeyOrCallback<Item>,
>(
	array: Item[],
	key: KeyArg,
	value: ValueArg,
): Simplify<Record<KeyOrCallbackKey<Item, KeyArg>, KeyOrCallbackValue<Item, ValueArg>>>;

/**
 * Create a record from an array of items using a specific key
 *
 * If multiple items have the same key, the latest item will be used
 *
 * @param array Array to convert
 * @param key Callback or key to use for grouping
 * @returns Record of keyed values
 *
 * @example
 * ```typescript
 * toRecord(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   item => item.value,
 * ); // => { 10: {id: 3, value: 10}, 20: {id: 2, value: 20} }
 * ```
 */
export function toRecord<Item, KeyArg extends KeyOrCallback<Item, Key>>(
	array: Item[],
	key: KeyArg,
): Simplify<Record<KeyOrCallbackKey<Item, KeyArg>, Item>>;

/**
 * Create a record from an array of items _(using indices as keys)_
 *
 * @param array Array to convert
 * @returns Record of indiced values
 *
 * @example
 * ```typescript
 * toRecord(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 * ); // => { 0: {id: 1, value: 10}, 1: {id: 2, value: 20}, 2: {id: 3, value: 10} }
 * ```
 */
export function toRecord<Item>(array: Item[]): Record<number, Item>;

export function toRecord(array: unknown[], first?: unknown, second?: unknown): unknown {
	return groupValues(array, first, second, false);
}

/**
 * Create a record from an array of items using a specific key, grouping values into arrays
 *
 * _Available as `toRecordArrays` and `toRecord.arrays`_
 *
 * @param array Array to convert
 * @param key Callback or key to use for grouping
 * @param value Callback or key to use for value, defaulting to the item itself
 * @returns Record of keyed arrays of values
 *
 * @example
 * ```typescript
 * toRecordArrays(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   item => item.value,
 *   item => item.id,
 * ); // => { 10: [1, 3], 20: [2] }
 * ```
 */
export function toRecordArrays<
	Item,
	KeyArg extends KeyOrCallback<Item, Key>,
	ValueArg extends KeyOrCallback<Item>,
>(
	array: Item[],
	key: KeyArg,
	value: ValueArg,
): Simplify<Record<KeyOrCallbackKey<Item, KeyArg>, Array<KeyOrCallbackValue<Item, ValueArg>>>>;

/**
 * Create a record from an array of items using a specific key, grouping items into arrays
 *
 * _Available as `toRecordArrays` and `toRecord.arrays`_
 *
 * @param array Array to convert
 * @param key Callback or key to use for grouping
 * @returns Record of keyed arrays of items
 *
 * @example
 * ```typescript
 * toRecordArrays(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   item => item.value,
 * ); // => { 10: [{id: 1, value: 10}, {id: 3, value: 10}], 20: [{id: 2, value: 20}] }
 * ```
 */
export function toRecordArrays<Item, KeyArg extends KeyOrCallback<Item, Key>>(
	array: Item[],
	key: KeyArg,
): Simplify<Record<KeyOrCallbackKey<Item, KeyArg>, Item[]>>;

export function toRecordArrays(array: unknown[], first?: unknown, second?: unknown): unknown {
	return groupValues(array, first, second, true);
}

// #endregion

// #region Initialization

toRecord.arrays = toRecordArrays;

Object.defineProperty(toRecord, 'arrays', {
	value: toRecordArrays,
});

// #endregion
