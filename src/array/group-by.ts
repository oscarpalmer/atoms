import {groupValues} from '../internal/array/group';
import type {Key, KeyOrCallback, KeyOrCallbackKey, KeyOrCallbackValue, Simplify} from '../models';

// #region Functions

/**
 * Create a record from an array of items using a specific key
 *
 * If multiple items have the same key, the latest item's value will be used
 *
 * @param array Array to group
 * @param key Callback or key to use for grouping
 * @param value Callback or key to use for value, defaulting to the item itself
 * @returns Record of keyed values
 *
 * @example
 * ```typescript
 * groupBy(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   item => item.value,
 *   item => item,
 * ); // => {10: {id: 3, value: 10}, 20: {id: 2, value: 20}}
 * ```
 */
export function groupBy<
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
 * @param array Array to group
 * @param key Callback or key to use for grouping
 * @returns Record of keyed items
 *
 * @example
 * ```typescript
 * groupBy(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   item => item.value,
 * ); // => {10: {id: 3, value: 10}, 20: {id: 2, value: 20}}
 * ```
 */
export function groupBy<Item, KeyArg extends KeyOrCallback<Item, Key>>(
	array: Item[],
	key: KeyArg,
): Simplify<Record<KeyOrCallbackKey<Item, KeyArg>, Item>>;

/**
 * Create a record from an array of items _(using indices as keys)_
 *
 * @param array Array to group
 * @returns Record of indiced items
 *
 * @example
 * ```typescript
 * groupBy(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 * ); // => {0: {id: 1, value: 10}, 1: {id: 2, value: 20}, 2: {id: 3, value: 10}}
 * ```
 */
export function groupBy<Item>(array: Item[]): Record<number, Item>;

export function groupBy(array: unknown[], first?: unknown, second?: unknown): unknown {
	return groupValues(array, first, second, false);
}

/**
 * Create a record from an array of items using a specific key, grouping values into arrays
 *
 * _Available as `groupArraysBy` and `groupBy.arrays`_
 *
 * @param array Array to group
 * @param key Callback or key to use for grouping
 * @param value Callback or key to use for value, defaulting to the item itself
 * @returns Record of keyed values
 *
 * @example
 * ```typescript
 * groupArraysBy(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   item => item.value,
 *   item => item,
 * ); // => {
 *    //   10: [{id: 1, value: 10}, {id: 3, value: 10}],
 *    //   20: [{id: 2, value: 20}],
 *    // }
 * ```
 */
export function groupArraysBy<
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
 * _Available as `groupArraysBy` and `groupBy.arrays`_
 *
 * @param array Array to group
 * @param key Callback or key to use for grouping
 * @returns Record of keyed items
 *
 * @example
 * ```typescript
 * groupArraysBy(
 *   [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 10}],
 *   item => item.value,
 * ); // => {
 *    //   10: [{id: 1, value: 10}, {id: 3, value: 10}],
 *    //   20: [{id: 2, value: 20}],
 *    // }
 * ```
 */
export function groupArraysBy<Item, KeyArg extends KeyOrCallback<Item, Key>>(
	array: Item[],
	key: KeyArg,
): Simplify<Record<KeyOrCallbackKey<Item, KeyArg>, Item[]>>;

export function groupArraysBy(array: unknown[], first?: unknown, second?: unknown): unknown {
	return groupValues(array, first, second, true);
}

// #endregion

// #region Initialization

groupBy.arrays = groupArraysBy;

Object.defineProperty(groupBy, 'arrays', {
	value: groupArraysBy,
});

// #endregion
