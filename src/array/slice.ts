import {getArrayCallbacks} from '../internal/array/callbacks';
import type {PlainObject} from '../models';

// #region Types

type ExtractType = 'drop' | 'take';

// #endregion

// #region Functions

/**
 * Drop items from the start of an array until they match a value
 * @param array Original array
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns New array with items dropped
 */
export function drop<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): Item[];

/**
 * Drop items from the start of an array until they match a value
 * @param array Original array
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @return New array with items dropped
 */
export function drop<Item, Callback extends (item: Item, index: number, array: Item[]) => unknown>(
	array: Item[],
	callback: Callback,
	value: ReturnType<Callback>,
): Item[];

/**
 * Drop items from the start of an array while they match a filter
 * @param array Original array
 * @param callback Filter callback to match items
 * @return New array with items dropped
 */
export function drop<Item extends PlainObject>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => boolean,
): Item[];

/**
 * Drop a specified number of items, from the start if `>= 0`, or from the end if `< 0`
 * @param array Original array
 * @param count Number of items to drop
 * @returns New array with items dropped
 */
export function drop(array: unknown[], count: number): unknown[];

export function drop(array: unknown[], first?: unknown, second?: unknown): unknown[] {
	return extract(EXTRACT_DROP, array, first, second);
}

function extract(
	type: ExtractType,
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

	const isTake = type === EXTRACT_TAKE;

	if (typeof first === 'number') {
		if (Math.abs(first) >= length) {
			return isTake ? array.slice() : [];
		}

		if (first === 0) {
			return isTake ? [] : array.slice();
		}

		if (isTake) {
			return first >= 0 ? array.slice(0, first) : array.slice(array.length + first);
		}

		return first >= 0 ? array.slice(first) : array.slice(0, array.length + first);
	}

	const callbacks =
		second == null ? getArrayCallbacks(first) : getArrayCallbacks(undefined, undefined, first);

	const isBoolean = callbacks?.bool != null;

	if (callbacks?.bool == null && callbacks?.value == null) {
		return isTake ? array.slice() : [];
	}

	const extracted: unknown[] = [];

	let push = false;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		const matches = isBoolean
			? callbacks.bool!(item, index, array)
			: Object.is(callbacks!.value!(item, index, array), second);

		if (isTake) {
			if (isBoolean ? !matches : matches) {
				break;
			}

			extracted.push(item);

			continue;
		}

		if (push) {
			extracted.push(item);
		} else if (isBoolean ? !matches : matches) {
			push = true;

			if (isBoolean) {
				extracted.push(item);
			}
		}
	}

	return extracted;
}

/**
 * Slice an array, returning a new array with a specified range of items
 * @param array Original array
 * @param start Start index _(inclusive)_
 * @param end End index _(exclusive)_
 * @return New array with sliced items
 */
export function slice<Item>(array: Item[], start: number, end: number): Item[];

/**
 * Slice an array, returning a new array with a specified number of items
 * @param array Original array
 * @param count Maximum sixe of the new array
 * @return New array with sliced items
 */
export function slice<Item>(array: Item[], count: number): Item[];

/**
 * Slice an array
 * @param array Array to slice
 * @returns Sliced array
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
 * @param array Original array
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns New array with taken items
 */
export function take<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): Item[];

/**
 * Take items from the start of an array until they match a value
 * @param array Original array
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @return New array with taken items
 */
export function take<Item, Callback extends (item: Item, index: number, array: Item[]) => unknown>(
	array: Item[],
	callback: Callback,
	value: ReturnType<Callback>,
): Item[];

/**
 * Take items from the start of an array while they match a filter
 * @param array Original array
 * @param callback Filter callback to match items
 * @return New array with taken items
 */
export function take<Item extends PlainObject>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => boolean,
): Item[];

/**
 * Take a specified number of items, from the start if `>= 0`, or from the end if `< 0`
 * @param array Original array
 * @param count Number of items to take
 * @returns New array with taken items
 */
export function take(array: unknown[], count: number): unknown[];

export function take(array: unknown[], first?: unknown, second?: unknown): unknown[] {
	return extract(EXTRACT_TAKE, array, first, second);
}

// #endregion

// #region Variables

const EXTRACT_DROP: ExtractType = 'drop';

const EXTRACT_TAKE: ExtractType = 'take';

// #endregion
