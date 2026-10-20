import {getArrayCallbacks} from '../internal/array/callbacks';
import {
	ARRAY_SLICE_DROP,
	ARRAY_SLICE_TAKE,
	type ArrayExtractType,
	type ArrayGetCallbacks,
} from '../models/array/array.misc.model';
import type {PlainObject} from '../models/index';

// #region Functions

/**
 * Drop items from the start of an array until they match a value
 *
 * @param array Original array
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns New array with items dropped
 *
 * @example
 * ```typescript
 * drop(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   item => item.id,
 *   2,
 * ); // => [{id: 2}, {id: 3}]
 * ```
 */
export function drop<Item, Callback extends (item: Item, index: number, array: Item[]) => unknown>(
	array: Item[],
	callback: Callback,
	value: ReturnType<Callback>,
): Item[];

/**
 * Drop items from the start of an array until they match a value
 *
 * @param array Original array
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns New array with items dropped
 *
 * @example
 * ```typescript
 * drop(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   'id',
 *   2,
 * ); // => [{id: 2}, {id: 3}]
 * ```
 */
export function drop<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): Item[];

/**
 * Drop items from the start of an array while they match a filter
 *
 * @param array Original array
 * @param callback Filter callback to match items
 * @returns New array with items dropped
 *
 * @example
 * ```typescript
 * drop(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   item => item.id === 2,
 * ); // => [{id: 2}, {id: 3}]
 * ```
 */
export function drop<Item extends PlainObject>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => boolean,
): Item[];

/**
 * Drop a specified number of items, from the start if `>= 0`, or from the end if `< 0`
 *
 * @param array Original array
 * @param count Number of items to drop
 * @returns New array with items dropped
 *
 * @example
 * ```typescript
 * drop([1, 2, 3, 4, 5], 2);  // => [3, 4, 5]
 * drop([1, 2, 3, 4, 5], -2); // => [1, 2, 3]
 * ```
 */
export function drop(array: unknown[], count: number): unknown[];

export function drop(array: unknown[], first?: unknown, second?: unknown): unknown[] {
	return extract(ARRAY_SLICE_DROP, array, first, second);
}

function extract(
	type: ArrayExtractType,
	array: unknown[],
	first?: unknown,
	second?: unknown,
): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	const {length} = array;

	if (length === 0) {
		return [];
	}

	const take = type === ARRAY_SLICE_TAKE;

	return typeof first === 'number'
		? getSlice(array, length, first, take)
		: extractSlice(array, length, first, second, take);
}

function extractSlice(
	array: unknown[],
	length: number,
	first: unknown,
	second: unknown,
	take: boolean,
) {
	const callbacks = getCallbacks(first, second);

	if (callbacks?.bool == null && callbacks?.value == null) {
		return take ? array.slice() : [];
	}

	const isBoolean = callbacks?.bool != null;

	const extracted: unknown[] = [];

	let push = false;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		const matches = isMatch(item, index, array, callbacks!, second, isBoolean);
		const reached = isBoolean ? !matches : matches;

		if (take && reached) {
			break;
		}

		if (push || take) {
			extracted.push(item);

			continue;
		}

		if (reached) {
			push = true;

			if (isBoolean) {
				extracted.push(item);
			}
		}
	}

	return extracted;
}

function getCallbacks(first: unknown, second: unknown): ArrayGetCallbacks | undefined {
	let callbacks: ArrayGetCallbacks | undefined;

	if (second == null) {
		callbacks = getArrayCallbacks(first);
	} else {
		callbacks = getArrayCallbacks(undefined, undefined, first);
	}

	return callbacks;
}

function getSlice(array: unknown[], length: number, amount: number, take: boolean): unknown[] {
	if (Math.abs(amount) >= length) {
		return take ? array.slice() : [];
	}

	if (amount === 0) {
		return take ? [] : array.slice();
	}

	if (take) {
		return amount >= 0 ? array.slice(0, amount) : array.slice(length + amount);
	}

	return amount >= 0 ? array.slice(amount) : array.slice(0, length + amount);
}

function isMatch(
	item: unknown,
	index: number,
	array: unknown[],
	callbacks: ArrayGetCallbacks,
	second: unknown,
	isBoolean: boolean,
): boolean {
	if (isBoolean) {
		return callbacks.bool!(item, index, array);
	}

	return Object.is(callbacks!.value!(item, index, array), second);
}

/**
 * Slice an array _(returning a new array with a specified range of items)_
 *
 * @param array Original array
 * @param start Start index _(inclusive)_
 * @param end End index _(exclusive)_
 * @returns New array with sliced items
 *
 * @example
 * ```typescript
 * slice([1, 2, 3, 4, 5], 1, 4); // => [2, 3, 4]
 * ```
 */
export function slice<Item>(array: Item[], start: number, end: number): Item[];

/**
 * Slice an array _(returning a new array with a specified number of items, from the start)_
 *
 * @param array Original array
 * @param count Maximum size of the new array
 * @returns New array with sliced items
 *
 * @example
 * ```typescript
 * slice([1, 2, 3, 4, 5], 3); // => [1, 2, 3]
 * ```
 */
export function slice<Item>(array: Item[], count: number): Item[];

/**
 * Slice an array _(returning a new array with all items)_
 *
 * @param array Array to slice
 * @returns Sliced array
 *
 * @example
 * ```typescript
 * slice([1, 2, 3]); // => [1, 2, 3]
 * ```
 */
export function slice<Item>(array: Item[]): Item[];

export function slice(array: unknown[], first?: number, second?: number): unknown[] {
	if (!Array.isArray(array) || array.length === 0) {
		return [];
	}

	const firstIsNumber = typeof first === 'number';
	const secondIsNumber = typeof second === 'number';

	if (!firstIsNumber && !secondIsNumber) {
		return array.slice();
	}

	if (!secondIsNumber) {
		return first! >= 0 ? array.slice(0, first) : array.slice(array.length + first!);
	}

	if (!firstIsNumber) {
		return array.slice();
	}

	return first! >= 0
		? array.slice(first!, second!)
		: array.slice(array.length + first!, array.length + second!);
}

/**
 * Take items from the start of an array until they match a value
 *
 * @param array Original array
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns New array with taken items
 *
 * @example
 * ```typescript
 * take(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   item => item.id,
 *   2,
 * ); // => [{id: 1}]
 * ```
 */
export function take<Item, Callback extends (item: Item, index: number, array: Item[]) => unknown>(
	array: Item[],
	callback: Callback,
	value: ReturnType<Callback>,
): Item[];

/**
 * Take items from the start of an array until they match a value
 *
 * @param array Original array
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns New array with taken items
 *
 * @example
 * ```typescript
 * take(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   'id',
 *   2,
 * ); // => [{id: 1}]
 * ```
 */
export function take<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): Item[];

/**
 * Take items from the start of an array while they match a filter
 *
 * @param array Original array
 * @param callback Filter callback to match items
 * @returns New array with taken items
 *
 * @example
 * ```typescript
 * take(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   item => item.id === 2,
 * ); // => [{id: 1}]
 * ```
 */
export function take<Item extends PlainObject>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => boolean,
): Item[];

/**
 * Take a specified number of items, from the start if `>= 0`, or from the end if `< 0`
 *
 * @param array Original array
 * @param count Number of items to take
 * @returns New array with taken items
 *
 * @example
 * ```typescript
 * take([1, 2, 3, 4, 5], 2);  // => [1, 2]
 * take([1, 2, 3, 4, 5], -2); // => [4, 5]
 * ```
 */
export function take(array: unknown[], count: number): unknown[];

export function take(array: unknown[], first?: unknown, second?: unknown): unknown[] {
	return extract(ARRAY_SLICE_TAKE, array, first, second);
}

// #endregion
