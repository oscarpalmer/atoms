import {isPlainObject} from '../internal/is';
import {floor, round} from '../internal/math/misc';
import {compare} from '../internal/value/compare';
import {
	arrayModifiers,
	SORT_DIRECTION_ASCENDING,
	SORT_DIRECTION_DESCENDING,
	SORT_PEEK_PERCENTAGE,
	SORT_THRESHOLD,
	SORTER_SYMBOL,
	type ArrayComparisonSorter,
	type ArrayKeySorter,
	type ArrayKeySorters,
	type ArraySorter,
	type ArraySorters,
	type ArrayValueSorter,
	type CompareCallback,
	type ComparisonSorter,
	type InternalSorter,
	type SortDirection,
	type Sorter,
	type SortHandler,
} from '../models/array/array.sort.model';
import type {PlainObject} from '../models/index';

// #region Instances

function Sorter(this: any, sorters: SortHandler[]): void {
	this[SORTER_SYMBOL] = sorters;
}

Sorter.prototype.index = getSortedArrayIndex;
Sorter.prototype.is = isSortedArray;
Sorter.prototype.sort = sortArray;

// #endregion

// #region Functions

function getComparisonSorter(callback: Function, modifier: number): SortHandler {
	return {
		modifier,
		comparison: {
			simple: callback,
		},
		get: false,
		identifier: callback.toString(),
	};
}

function getComparisonValue(
	first: unknown,
	second: unknown,
	sorters: SortHandler[],
	length: number,
): number {
	for (let index = 0; index < length; index += 1) {
		const sorter = sorters[index];

		const values = [
			sorter.get ? sorter.value?.(first) : first,
			sorter.get ? sorter.value?.(second) : second,
		];

		const comparison =
			(sorter.comparison?.complex?.(first, values[0], second, values[1]) ??
				sorter.comparison?.simple?.(values[0], values[1]) ??
				compare(values[0], values[1])) * sorter.modifier;

		if (comparison !== 0) {
			return comparison;
		}
	}

	return 0;
}

function getModifier(first: unknown, second: unknown): number {
	const direction =
		first === true || second === true ? SORT_DIRECTION_DESCENDING : SORT_DIRECTION_ASCENDING;

	return arrayModifiers[direction];
}

function getObjectSorter(obj: PlainObject, modifier: number): SortHandler | undefined {
	let sorter: SortHandler | undefined;

	if (typeof obj.comparison === 'function') {
		sorter = getComparisonSorter(obj.comparison, modifier);
	} else if (typeof obj.key === 'string') {
		sorter = getValueSortHandlers(obj.key, modifier);

		if (typeof obj.compare === 'function') {
			sorter.comparison = {
				complex: obj.compare,
			};
		}
	} else if (typeof obj.value === 'function') {
		sorter = getValueSortHandlers(obj.value, modifier);
	}

	if (sorter != null && typeof obj.direction === 'string') {
		sorter.modifier = arrayModifiers[obj.direction] ?? modifier;
	}

	return sorter;
}

function getSortedArrayIndex(
	this: InternalSorter | SortHandler[],
	array: unknown[],
	item: unknown,
): number {
	if (!Array.isArray(array)) {
		return -1;
	}

	const {length} = array;

	if (length === 0) {
		return 0;
	}

	const sorters = Array.isArray(this) ? this : this[SORTER_SYMBOL];

	const sortersLength = sorters.length;

	if (getComparisonValue(item, array[0], sorters, sortersLength) < 0) {
		return 0;
	}

	if (getComparisonValue(item, array[length - 1], sorters, sortersLength) >= 0) {
		return length;
	}

	let low = 0;
	let high = length - 1;

	while (low <= high) {
		const mid = floor((low + high) / 2);

		if (getComparisonValue(item, array[mid], sorters, sortersLength) < 0) {
			high = mid - 1;
		} else {
			low = mid + 1;
		}
	}

	return low;
}

/**
 * Get the index for an item _(to be inserted into an array of items)_ based on sorters _(and an optional default direction)_
 *
 * _(If the array is not sorted, it will be treated as sorted, and the result may be inaccurate)_
 *
 * _Available as `getSortedIndex` and `sort.getIndex`_
 *
 * @param array Array to get the index from
 * @param item Item to get the index for
 * @param sorters Sorters to use to determine sorting
 * @param descending Sorted in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Index for item
 */
export function getSortedIndex<Item>(
	array: Item[],
	item: Item,
	sorters: Array<ArraySorter<Item>>,
	descending?: boolean,
): number;

/**
 * Get the index for an item _(to be inserted into an array of items)_ based on a sorter _(and an optional default direction)_
 *
 * _(If the array is not sorted, it will be treated as sorted, and the result may be inaccurate)_
 *
 * _Available as `getSortedIndex` and `sort.getIndex`_
 *
 * @param array Array to get the index from
 * @param item Item to get the index for
 * @param sorter Sorter to use to determine sorting
 * @param descending Sorted in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Index for item
 */
export function getSortedIndex<Item>(
	array: Item[],
	item: Item,
	sorter: ArraySorter<Item>,
	descending?: boolean,
): number;

/**
 * Get the index for an item _(to be inserted into an array of items)_ based on an optional default direction_
 *
 * _(If the array is not sorted, it will be treated as sorted, and the result may be inaccurate)_
 *
 * _Available as `getSortedIndex` and `sort.getIndex`_
 *
 * @param array Array to get the index from
 * @param item Item to get the index for
 * @param descending Sorted in descending order? _(defaults to `false`)_
 * @returns Index for item
 */
export function getSortedIndex<Item>(array: Item[], item: Item, descending?: boolean): number;

export function getSortedIndex(
	array: unknown[],
	item: unknown,
	first?: unknown,
	second?: unknown,
): number {
	return getSortedArrayIndex.call(getSortHandlers(first, getModifier(first, second)), array, item);
}

function getSortHandler(value: unknown, modifier: number): SortHandler | undefined {
	switch (true) {
		case typeof value === 'function':
			return getComparisonSorter(value, modifier);

		case typeof value === 'string':
			return getValueSortHandlers(value, modifier);

		case isPlainObject(value):
			return getObjectSorter(value, modifier);

		case true:
			break;
	}

	return undefined;
}

function getSortHandlers(value: unknown, modifier: number): SortHandler[] {
	const array = Array.isArray(value) ? value : [value];
	const {length} = array;

	const sorters: SortHandler[] = [];

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		const sorter = getSortHandler(item, modifier);

		if (sorter != null) {
			sorters.push(sorter);
		}
	}

	if (sorters.length === 0) {
		return [
			{
				modifier,
				get: false,
				identifier: 'default',
			},
		];
	}

	return sorters.filter(
		(value, index, array) =>
			array.findIndex(next => next.identifier === value.identifier) === index,
	);
}

function getValueSortHandlers(value: string | Function, modifier: number): SortHandler {
	const isFunction = typeof value === 'function';

	return {
		modifier,
		get: true,
		identifier: isFunction ? value.toString() : value,
		value: isFunction ? value : (item: unknown) => (item as PlainObject)[value],
	};
}

/**
 * Initialize a sort handler with sorters _(and an optional default direction)_
 *
 * _Available as `initializeSorter` and `sort.initialize`_
 *
 * @param sorters Sorters to use for sorting
 * @param descending Sort in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Sort handler
 */
export function initializeSorter<Item>(
	sorters: Array<ArraySorter<Item>>,
	descending?: boolean,
): Sorter<Item>;

/**
 * Initialize a sort handler with a sorter _(and an optional default direction)_
 *
 * _Available as `initializeSorter` and `sort.initialize`_
 *
 * @param sorter Sorter to use for sorting
 * @param descending Sort in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Sort handler
 */
export function initializeSorter<Item>(
	sorter: ArraySorter<Item>,
	descending?: boolean,
): Sorter<Item>;

/**
 * Initialize a sort handler _(with an optional default direction)_
 *
 * _Available as `initializeSorter` and `sort.initialize`_
 *
 * @param descending Sort in descending order? _(defaults to `false`)_
 * @returns Sort handler
 */
export function initializeSorter<Item>(descending?: boolean): Sorter<Item>;

export function initializeSorter(first?: unknown, second?: unknown): Sorter<unknown> {
	// @ts-expect-error All good, no worries :-)
	return new Sorter(getSortHandlers(first, getModifier(first, second)));
}

/**
 * Is the array sorted according to the sorters _(and the optional default direction)_?
 *
 * _Available as `isSorted` and `sort.is`_
 *
 * @param array Array to check
 * @param sorters Sorters to determine sorting
 * @param descending Sorted in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns `true` if sorted, otherwise `false`
 */
export function isSorted<Item>(
	array: Item[],
	sorters: Array<ArraySorter<Item>>,
	descending?: boolean,
): boolean;

/**
 * Is the array sorted according to the sorter _(and the optional default direction)_?
 *
 * _Available as `isSorted` and `sort.is`_
 *
 * @param array Array to check
 * @param sorter Sorter to determine sorting
 * @param descending Sorted in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns `true` if sorted, otherwise `false`
 */
export function isSorted<Item>(
	array: Item[],
	sorter: ArraySorter<Item>,
	descending?: boolean,
): boolean;

/**
 * Is the array sorted?
 *
 * _Available as `isSorted` and `sort.is`_
 *
 * @param array Array to check
 * @param descending Sorted in descending order? _(defaults to `false`)_
 * @returns `true` if sorted, otherwise `false`
 */
export function isSorted<Item>(array: Item[], descending?: boolean): boolean;

export function isSorted(array: unknown[], first?: unknown, second?: unknown): boolean {
	return isSortedArray.call(getSortHandlers(first, getModifier(first, second)), array);
}

function isSortedArray(this: InternalSorter | SortHandler[], array: unknown[]): boolean {
	if (!Array.isArray(array)) {
		return false;
	}

	const {length} = array;

	if (length < 2) {
		return true;
	}

	const sorters = Array.isArray(this) ? this : this[SORTER_SYMBOL];

	const sortersLength = sorters.length;

	let offset = 0;

	if (length >= SORT_THRESHOLD) {
		offset = round(length / SORT_PEEK_PERCENTAGE);
		offset = offset > SORT_THRESHOLD ? SORT_THRESHOLD : offset;

		for (let index = 0; index < offset; index += 1) {
			const [firstItem, firstOffset] = [array[index], array[index + 1]];
			const [secondItem, secondOffset] = [array[length - index - 2], array[length - index - 1]];

			const [firstComparison, secondComparison] = [
				getComparisonValue(firstItem, firstOffset, sorters, sortersLength),
				getComparisonValue(secondItem, secondOffset, sorters, sortersLength),
			];

			if (firstComparison > 0 || secondComparison > 0) {
				return false;
			}
		}
	}

	const end = length - offset - 1;

	for (let index = offset; index < end; index += 1) {
		const first = array[index];
		const second = array[index + 1];

		const comparison = getComparisonValue(first, second, sorters, sortersLength);

		if (comparison > 0) {
			return false;
		}
	}

	return true;
}

/**
 * Sort an array of items using a comparison callback
 *
 * @param array Array to sort
 * @param comparator Comparator to use for sorting
 * @param descending Sort in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Sorted array
 *
 * @example
 * ```typescript
 * sort(
 *   [{id: 3}, {id: 1}, {id: 2}],
 *   (first, second) => first.id - second.id,
 * ); // => [{id: 1}, {id: 2}, {id: 3}]
 * ```
 */
export function sort<Item>(
	array: Item[],
	comparator: (first: Item, second: Item) => number,
	descending?: boolean,
): Item[];

/**
 * Sort an array of items, using multiple sorters to sort by specific values
 *
 * @param array Array to sort
 * @param sorters Sorters to use for sorting
 * @param descending Sort in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Sorted array
 */
export function sort<Item>(
	array: Item[],
	sorters: Array<ArraySorter<Item>>,
	descending?: boolean,
): Item[];

/**
 * Sort an array of items, using a single sorter to sort by a specific value
 *
 * @param array Array to sort
 * @param sorter Sorter to use for sorting
 * @param descending Sort in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Sorted array
 */
export function sort<Item>(array: Item[], sorter: ArraySorter<Item>, descending?: boolean): Item[];

/**
 * Sort an array of items
 *
 * @param array Array to sort
 * @param descending Sort in descending order? _(defaults to `false`)_
 * @returns Sorted array
 */
export function sort<Item>(array: Item[], descending?: boolean): Item[];

export function sort(array: unknown[], first?: unknown, second?: unknown): unknown[] {
	return sortArray.call(getSortHandlers(first, getModifier(first, second)), array);
}

function sortArray(this: InternalSorter | SortHandler[], array: unknown[]): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	const sorters = Array.isArray(this) ? this : this[SORTER_SYMBOL];
	const {length} = sorters;

	return array.length > 1
		? array.sort((first, second) => getComparisonValue(first, second, sorters, length))
		: array;
}

// #endregion

// #region Namespace

export declare namespace sort {
	export var getIndex: typeof getSortedIndex;
	export var initialize: typeof initializeSorter;
	export var is: typeof isSorted;
}

// #endregion

// #region Initialization

sort.getIndex = getSortedIndex;
sort.initialize = initializeSorter;
sort.is = isSorted;

// #endregion

// #region Exports

export {
	SORT_DIRECTION_ASCENDING,
	SORT_DIRECTION_DESCENDING,
	type ArrayComparisonSorter,
	type ArrayKeySorter,
	type ArrayKeySorters,
	type ArraySorter,
	type ArraySorters,
	type ArrayValueSorter,
	type CompareCallback,
	type ComparisonSorter,
	type SortDirection,
	type Sorter,
};

// #endregion
