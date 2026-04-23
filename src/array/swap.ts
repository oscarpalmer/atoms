import {getArrayCallback} from '../internal/array/callbacks';
import {indexOf} from '../internal/array/index-of';
import {arraysOverlap} from '../internal/array/overlap';
import type {PlainObject} from '../models';
import {indexOfArray} from './position';

/**
 * Swap two smaller arrays within a larger array
 *
 * If either of the smaller arrays are not present in the larger array, or if they overlap, the larger array will be returned unchanged
 * @param array Array of items to swap
 * @param first First array
 * @param second Second array
 * @param key Key to get an item's value for matching
 * @returns Original array with items swapped _(or unchanged if unable to swap)_
 */
export function swap<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	first: Item[],
	second: Item[],
	key: ItemKey,
): Item[];

/**
 * Swap two smaller arrays within a larger array
 *
 * If either of the smaller arrays are not present in the larger array, or if they overlap, the larger array will be returned unchanged
 * @param array Array of items to swap
 * @param first First array
 * @param second Second array
 * @param callback Callback to get an item's value for matching
 * @returns Original array with items swapped _(or unchanged if unable to swap)_
 */
export function swap<Item>(
	array: Item[],
	first: Item[],
	second: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
): Item[];

/**
 * Swap two smaller arrays within a larger array
 *
 * If either of the smaller arrays are not present in the larger array, or if they overlap, the larger array will be returned unchanged
 * @param array Array of items to swap
 * @param first First array
 * @param second Second array
 * @returns Original array with items swapped _(or unchanged if unable to swap)_
 */
export function swap<Item>(array: Item[], first: Item[], second: Item[]): Item[];

/**
 * Swap two indiced items in an array
 *
 * If either of the items are not present in the array, the array will be returned unchanged
 * @param array Array of items to swap
 * @param first First item
 * @param second Second item
 * @param key Key to get an item's value for matching
 * @returns Original array with items swapped _(or unchanged if unable to swap)_
 */
export function swap<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	first: Item,
	second: Item,
	key: ItemKey,
): Item[];

/**
 * Swap two indiced items in an array
 *
 * If either of the items are not present in the array, the array will be returned unchanged
 * @param array Array of items to swap
 * @param first First item
 * @param second Second item
 * @param callback Callback to get an item's value for matching
 * @returns Original array with items swapped _(or unchanged if unable to swap)_
 */
export function swap<Item>(
	array: Item[],
	first: Item,
	second: Item,
	callback: (item: Item, index: number, array: Item[]) => unknown,
): Item[];

/**
 * Swap two indiced items in an array
 * @param array Array of items to swap
 * @param first First item
 * @param second Second item
 * @returns Original array with items swapped _(or unchanged if unable to swap)_
 */
export function swap<Item>(array: Item[], first: Item, second: Item): Item[];

export function swap(
	array: unknown[],
	first: unknown,
	second: unknown,
	third?: unknown,
): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	if (array.length === 0) {
		return array;
	}

	if (Array.isArray(first) && Array.isArray(second)) {
		return swapArrays(array, first, second, third);
	}

	return swapValues(array, first, second, third);
}

swap.indices = swapIndices;

function swapArrays(array: unknown[], from: unknown[], to: unknown[], key: unknown): unknown[] {
	if (from.length === 0 || to.length === 0) {
		return array;
	}

	if (from.length === 1 && to.length === 1) {
		return swapValues(array, from[0], to[0], key);
	}

	const fromIndex = indexOfArray(array, from, key as never);
	const toIndex = indexOfArray(array, to, key as never);

	if (fromIndex === -1 || toIndex === -1) {
		return array;
	}

	const {first, second, overlap} = arraysOverlap(
		{
			array: from,
			index: fromIndex,
		},
		{
			array: to,
			index: toIndex,
		},
	);

	if (overlap) {
		// The arrays overlap, so we can't swap them without losing data

		return array;
	}

	array.splice(first.index, first.array.length, ...second.array);

	array.splice(
		second.index + (second.array.length - first.array.length),
		second.array.length,
		...first.array,
	);

	return array;
}

/**
 * Swap two indiced items in an array
 *
 * If either index is out of bounds, the array will be returned unchanged
 *
 * Available as `swapIndices` and `swap.indices`
 * @param array Array of items to swap
 * @param first First index _(can be negative to count from the end)_
 * @param second Second index _(can be negative to count from the end)_
 * @returns Original array with items swapped _(or unchanged if unable to swap)_
 */
function swapIndices<Item>(array: Item[], first: number, second: number): Item[] {
	if (!Array.isArray(array) || array.length === 0) {
		return [];
	}

	if (typeof first !== 'number' || typeof second !== 'number') {
		return array;
	}

	const firstIndex = first < 0 ? array.length + first : first;
	const secondIndex = second < 0 ? array.length + second : second;

	if (firstIndex === secondIndex || firstIndex >= array.length || secondIndex >= array.length) {
		return array;
	}

	const temp = array[firstIndex];

	array[firstIndex] = array[secondIndex];
	array[secondIndex] = temp;

	return array;
}

function swapValues(array: unknown[], from: unknown, to: unknown, key?: unknown): unknown[] {
	const callback = getArrayCallback(key);

	const first =
		callback == null
			? array.indexOf(from)
			: indexOf(array, callback, callback(from, undefined, []));

	const second =
		callback == null ? array.indexOf(to) : indexOf(array, callback, callback(to, undefined, []));

	if (first === second || first === -1 || second === -1) {
		return array;
	}

	return swapIndices(array, first, second);
}
