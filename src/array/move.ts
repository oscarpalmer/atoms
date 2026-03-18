import {arraysOverlap} from '../internal/array/overlap';
import type {PlainObject} from '../models';
import {indexOfArray} from './position';

/**
 * Move an item _(or array of items)_ to the position of another item _(or array of items)_ within an array
 *
 * When moving to the front of the array, the moved items will be placed __before__ the target item. When moving to the back of the array, the moved items will be placed __after__ the target item.
 *
 * If either of values are not present in the array, or if they overlap, the array will be returned unchanged
 * @param array Array to move within
 * @param from Item or items to move
 * @param to Item or items to move to
 * @param key Key to get an item's value for matching
 * @returns Original array with items moved _(or unchanged if unable to move)_
 */
export function move<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	from: Item | Item[],
	to: Item | Item[],
	key: ItemKey,
): Item[];

/**
 * Move an item _(or array of items)_ to the position of another item _(or array of items)_ within an array
 *
 * When moving to the front of the array, the moved items will be placed __before__ the target item. When moving to the back of the array, the moved items will be placed __after__ the target item.
 *
 * If either of values are not present in the array, or if they overlap, the array will be returned unchanged
 * @param array Array to move within
 * @param from Item or items to move
 * @param to Item or items to move to
 * @param callback Callback to get an item's value for matching
 * @returns Original array with items moved _(or unchanged if unable to move)_
 */
export function move<Item>(
	array: Item[],
	from: Item | Item[],
	to: Item | Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
): Item[];

/**
 * Move an item _(or array of items)_ to the position of another item _(or array of items)_ within an array
 *
 * When moving to the front of the array, the moved items will be placed __before__ the target item. When moving to the back of the array, the moved items will be placed __after__ the target item.
 *
 * If either of values are not present in the array, or if they overlap, the array will be returned unchanged
 * @param array Array to move within
 * @param from Item or items to move
 * @param to Item or items to move to
 * @returns Original array with items moved _(or unchanged if unable to move)_
 */
export function move<Item>(array: Item[], from: Item | Item[], to: Item | Item[]): Item[];

export function move(array: unknown[], from: unknown, to: unknown, key?: unknown): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	const firstArray = Array.isArray(from) ? from : [from];
	const secondArray = Array.isArray(to) ? to : [to];

	if (firstArray.length === 0 || secondArray.length === 0) {
		return array;
	}

	const firstPosition = indexOfArray(array, firstArray, key as never);
	const secondPosition = indexOfArray(array, secondArray, key as never);

	if (firstPosition === -1 || secondPosition === -1 || firstPosition === secondPosition) {
		return array;
	}

	const {overlap} = arraysOverlap(
		{
			array: firstArray,
			index: firstPosition,
		},
		{
			array: secondArray,
			index: secondPosition,
		},
	);

	if (overlap) {
		// The arrays overlap, so we can't swap them without losing data

		return array;
	}

	array.splice(firstPosition, firstArray.length);

	const next =
		secondPosition < firstPosition
			? secondPosition
			: secondPosition + secondArray.length - firstArray.length;

	if (next >= array.length) {
		array.push(...firstArray);
	} else {
		array.splice(next, 0, ...firstArray);
	}

	return array;
}

move.indices = moveIndices;
move.toIndex = moveToIndex;

/**
 * Move an item from one index to another within an array
 *
 * If the from index is out of bounds, the array will be returned unchanged
 * @param array Array to move within
 * @param from Index to move from
 * @param to Index to move to
 * @returns Original array with item moved _(or unchanged if unable to move)_
 */
function moveIndices<Item>(array: Item[], from: number, to: number): Item[] {
	if (!Array.isArray(array)) {
		return [];
	}

	const {length} = array;

	if (length === 0 || typeof from !== 'number' || typeof to !== 'number') {
		return array;
	}

	const fromIndex = from < 0 ? length + from : from;
	const toIndex = to < 0 ? length + to : to;

	if (fromIndex === toIndex || fromIndex >= length || toIndex >= length) {
		return array;
	}

	const spliced = array.splice(fromIndex, 1);

	if (toIndex >= array.length) {
		array.push(...spliced);
	} else {
		array.splice(toIndex, 0, ...spliced);
	}

	return array;
}

/**
 * Move an item _(or array of items)_ to an index within an array
 *
 * If the value is not present in the array, or if the index is out of bounds, the array will be returned unchanged
 * @param array Array to move within
 * @param value Item or items to move
 * @param index Index to move to
 * @param key Key to get an item's value for matching
 * @returns Original array with items moved _(or unchanged if unable to move)_
 */
function moveToIndex<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	value: Item | Item[],
	index: number,
	key: ItemKey,
): Item[];

/**
 * Move an item _(or array of items)_ to an index within an array
 *
 * If the value is not present in the array, or if the index is out of bounds, the array will be returned unchanged
 * @param array Array to move within
 * @param value Item or items to move
 * @param index Index to move to
 * @param callback Callback to get an item's value for matching
 * @returns Original array with items moved _(or unchanged if unable to move)_
 */
function moveToIndex<Item>(
	array: Item[],
	value: Item | Item[],
	index: number,
	callback: (item: Item, index: number, array: Item[]) => unknown,
): Item[];

/**
 * Move an item _(or array of items)_ to an index within an array
 *
 * If the value is not present in the array, or if the index is out of bounds, the array will be returned unchanged
 * @param array Array to move within
 * @param value Item or items to move
 * @param index Index to move to
 * @returns Original array with items moved _(or unchanged if unable to move)_
 */
function moveToIndex<Item>(array: Item[], value: Item | Item[], index: number): Item[];

function moveToIndex(array: unknown[], value: unknown, index: number, key?: unknown): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	const {length} = array;

	if (length === 0 || typeof index !== 'number') {
		return array;
	}

	const next = index < 0 ? length + index : index;

	if (next >= length) {
		return array;
	}

	const values = Array.isArray(value) ? value : [value];

	const position = indexOfArray(array, values, key as never);

	if (position === -1 || position === next) {
		return array;
	}

	array.splice(position, values.length);

	if (next >= array.length) {
		array.push(...values);
	} else {
		array.splice(next, 0, ...values);
	}

	return array;
}
