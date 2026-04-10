import {isPlainObject} from '../internal/is';
import {compare} from '../internal/value/compare';
import type {PlainObject, Primitive} from '../models';

// #region Types

/**
 * Sorting information for arrays _(using a comparison callback)_
 */
export type ArrayComparisonSorter<Item> = {
	/**
	 * Callback to use when comparing items and values
	 */
	comparison: ComparisonSorter<Item>;
	/**
	 * Direction to sort by
	 */
	direction?: SortDirection;
};

/**
 * Sorting information for arrays _(using a key)_
 */
export type ArrayKeySorter<Item extends PlainObject, ItemKey extends keyof Item> = {
	/**
	 * Comparator to use when comparing items and values
	 */
	compare?: CompareCallback<Item, Item[ItemKey]>;
	/**
	 * Direction to sort by
	 */
	direction?: SortDirection;
	/**
	 * Key to sort by
	 */
	key: ItemKey;
};

/**
 * Sorters based on keys in an object
 */
type ArrayKeySorters<Item extends PlainObject> = {
	[ItemKey in keyof Item]: ArrayKeySorter<Item, ItemKey>;
}[keyof Item];

/**
 * Sorter to use for sorting
 */
type ArraySorter<Item> = Item extends PlainObject
	?
			| keyof Item
			| ArrayComparisonSorter<Item>
			| ArrayKeySorters<Item>
			| ArrayValueSorter<Item>
			| ComparisonSorter<Item>
	: ArrayComparisonSorter<Item> | ArrayValueSorter<Item> | ComparisonSorter<Item>;

/**
 * Sorting information for arrays _(using a value callback and built-in comparison)_
 */
export type ArrayValueSorter<Item> = {
	/**
	 * Direction to sort by
	 */
	direction?: SortDirection;
	/**
	 * Value to sort by
	 */
	value: (item: Item) => unknown;
};

/**
 * Comparator to use when comparing items and values
 */
type CompareCallback<Item, Value = CompareCallbackValue<Item>> = (
	first: Item,
	firstValue: Value,
	second: Item,
	secondValue: Value,
) => number;

type CompareCallbackValue<Item> = Item extends Primitive ? Item : unknown;

/**
 * Callback to use when comparing items and values
 */
type ComparisonSorter<Item> = (first: Item, second: Item) => number;

type InternalSorter = {
	compare?: InternalSorterCompare;
	get: boolean;
	identifier: string;
	modifier: number;
	value?: Function;
};

type InternalSorterCompare = {
	complex?: Function;
	simple?: Function;
};

/**
 * Direction to sort by
 */
export type SortDirection = 'ascending' | 'descending';

export type Sorter<Item> = {
	/**
	 * Sort an array of items
	 * @param array Array to sort
	 * @returns Sorted array
	 */
	(array: Item[]): Item[];

	/**
	 * Get the index for an item _(to be inserted into an array of items)_
	 *
	 * _(If the array is not sorted, it will be treated as sorted, and the result may be inaccurate)_
	 * @param array Array to get the index from
	 * @param item Item to get the index for
	 * @returns Index for item
	 */
	index(array: Item[], item: Item): number;

	/**
	 * Is the array sorted?
	 * @param array Array to check
	 * @returns `true` if sorted, otherwise `false`
	 */
	is(array: Item[]): boolean;
};

// #endregion

// #region Functions

function getComparisonSorter(callback: Function, modifier: number): InternalSorter {
	return {
		modifier,
		compare: {
			simple: callback,
		},
		get: false,
		identifier: String(callback),
	};
}

function getComparisonValue(
	first: unknown,
	second: unknown,
	sorters: InternalSorter[],
	length: number,
): number {
	for (let index = 0; index < length; index += 1) {
		const sorter = sorters[index];

		const values = [
			sorter.get ? sorter.value!(first as PlainObject) : first,
			sorter.get ? sorter.value!(second as PlainObject) : second,
		];

		const comparison =
			(sorter.compare?.complex?.(first, values[0], second, values[1]) ??
				sorter.compare?.simple?.(values[0], values[1]) ??
				compare(values[0], values[1])) * sorter.modifier;

		if (comparison !== 0) {
			return comparison;
		}
	}

	return 0;
}

/**
 * Get the index for an item _(to be inserted into an array of items)_ based on sorters _(and an optional default direction)_
 *
 * _(If the array is not sorted, it will be treated as sorted, and the result may be inaccurate)_
 * @param array Array to get the index from
 * @param item Item to get the index for
 * @param sorters Sorters to use to determine sorting
 * @param descending Sorted in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Index for item
 */
function getIndex<Item>(
	array: Item[],
	item: Item,
	sorters: Array<ArraySorter<Item>>,
	descending?: boolean,
): number;

/**
 * Get the index for an item _(to be inserted into an array of items)_ based on a sorter _(and an optional default direction)_
 *
 * _(If the array is not sorted, it will be treated as sorted, and the result may be inaccurate)_
 * @param array Array to get the index from
 * @param item Item to get the index for
 * @param sorter Sorter to use to determine sorting
 * @param descending Sorted in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Index for item
 */
function getIndex<Item>(
	array: Item[],
	item: Item,
	sorter: ArraySorter<Item>,
	descending?: boolean,
): number;

/**
 * Get the index for an item _(to be inserted into an array of items)_ based on an optional default direction_
 *
 * _(If the array is not sorted, it will be treated as sorted, and the result may be inaccurate)_
 * @param array Array to get the index from
 * @param item Item to get the index for
 * @param descending Sorted in descending order? _(defaults to `false`)_
 * @returns Index for item
 */
function getIndex<Item>(array: Item[], item: Item, descending?: boolean): number;

function getIndex(array: unknown[], item: unknown, first?: unknown, second?: unknown): number {
	return getSortedIndex(array, item, getSorters(first, getModifier(first, second)));
}

function getModifier(first: unknown, second: unknown): number {
	const direction =
		first === true || second === true ? SORT_DIRECTION_DESCENDING : SORT_DIRECTION_ASCENDING;

	return modifiers[direction];
}

function getObjectSorter(obj: PlainObject, modifier: number): InternalSorter | undefined {
	let sorter: InternalSorter | undefined;

	if (typeof obj.comparison === 'function') {
		sorter = getComparisonSorter(obj.comparison, modifier);
	} else if (typeof obj.key === 'string') {
		sorter = getValueSorter(obj.key, modifier);

		if (typeof obj.compare === 'function') {
			sorter.compare = {
				complex: obj.compare,
			};
		}
	} else if (typeof obj.value === 'function') {
		sorter = getValueSorter(obj.value, modifier);
	}

	if (sorter != null && typeof obj.direction === 'string') {
		sorter.modifier = modifiers[obj.direction as SortDirection] ?? modifier;
	}

	return sorter;
}

function getSortedIndex(array: unknown[], item: unknown, sorters: InternalSorter[]): number {
	if (!Array.isArray(array)) {
		return -1;
	}

	const {length} = array;

	if (length === 0) {
		return 0;
	}

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
		const mid = Math.floor((low + high) / 2);

		if (getComparisonValue(item, array[mid], sorters, sortersLength) < 0) {
			high = mid - 1;
		} else {
			low = mid + 1;
		}
	}

	return low;
}

function getSorter(value: unknown, modifier: number): InternalSorter | undefined {
	switch (true) {
		case typeof value === 'function':
			return getComparisonSorter(value, modifier);

		case typeof value === 'string':
			return getValueSorter(value, modifier);

		case isPlainObject(value):
			return getObjectSorter(value, modifier);

		default:
			break;
	}
}

function getSorters(value: unknown, modifier: number): InternalSorter[] {
	const array = Array.isArray(value) ? value : [value];
	const {length} = array;

	const sorters: InternalSorter[] = [];

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		const sorter = getSorter(item, modifier);

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

function getValueSorter(value: string | Function, modifier: number): InternalSorter {
	return {
		modifier,
		get: true,
		identifier: String(value),
		value: typeof value === 'function' ? value : (item: unknown) => (item as PlainObject)[value],
	};
}

/**
 * Initialize a sort handler with sorters _(and an optional default direction)_
 * @param sorters Sorters to use for sorting
 * @param descending Sort in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Sort handler
 */
function initializeSort<Item>(
	sorters: Array<ArraySorter<Item>>,
	descending?: boolean,
): Sorter<Item>;

/**
 * Initialize a sort handler with a sorter _(and an optional default direction)_
 * @param sorter Sorter to use for sorting
 * @param descending Sort in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Sort handler
 */
function initializeSort<Item>(sorter: ArraySorter<Item>, descending?: boolean): Sorter<Item>;

/**
 * Initialize a sort handler _(with an optional default direction)_
 * @param descending Sort in descending order? _(defaults to `false`)_
 * @returns Sort handler
 */
function initializeSort<Item>(descending?: boolean): Sorter<Item>;

function initializeSort(first?: unknown, second?: unknown): Sorter<unknown> {
	const sorters = getSorters(first, getModifier(first, second));

	const sorter = (array: unknown[]) => sortArray(array, sorters);

	sorter.index = (array: unknown[], item: unknown) => getSortedIndex(array, item, sorters);
	sorter.is = (array: unknown[]) => isSortedArray(array, sorters);

	return sorter as unknown as Sorter<unknown>;
}

/**
 * Is the array sorted according to the sorters _(and the optional default direction)_?
 * @param array Array to check
 * @param sorters Sorters to determine sorting
 * @param descending Sorted in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns `true` if sorted, otherwise `false`
 */
function isSorted<Item>(
	array: Item[],
	sorters: Array<ArraySorter<Item>>,
	descending?: boolean,
): boolean;

/**
 * Is the array sorted according to the sorter _(and the optional default direction)_?
 * @param array Array to check
 * @param sorter Sorter to determine sorting
 * @param descending Sorted in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns `true` if sorted, otherwise `false`
 */
function isSorted<Item>(array: Item[], sorter: ArraySorter<Item>, descending?: boolean): boolean;

/**
 * Is the array sorted?
 * @param array Array to check
 * @param descending Sorted in descending order? _(defaults to `false`)_
 * @returns `true` if sorted, otherwise `false`
 */
function isSorted<Item>(array: Item[], descending?: boolean): boolean;

function isSorted(array: unknown[], first?: unknown, second?: unknown): boolean {
	return isSortedArray(array, getSorters(first, getModifier(first, second)));
}

function isSortedArray(array: unknown[], sorters: InternalSorter[]): boolean {
	if (!Array.isArray(array)) {
		return false;
	}

	const {length} = array;

	if (length < 2) {
		return true;
	}

	const sortersLength = sorters.length;

	let offset = 0;

	if (length >= ARRAY_THRESHOLD) {
		offset = Math.round(length / ARRAY_PEEK_PERCENTAGE);
		offset = offset > ARRAY_THRESHOLD ? ARRAY_THRESHOLD : offset;

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
 * Sort an array of items, using multiple sorters to sort by specific values
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
 * Sort an array of items, using multiple sorters to sort by specific values
 * @param array Array to sort
 * @param sorter Sorter to use for sorting
 * @param descending Sort in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Sorted array
 */
export function sort<Item>(array: Item[], sorter: ArraySorter<Item>, descending?: boolean): Item[];

/**
 * Sort an array of items
 * @param array Array to sort
 * @param descending Sort in descending order? _(defaults to `false`)_
 * @returns Sorted array
 */
export function sort<Item>(array: Item[], descending?: boolean): Item[];

export function sort(array: unknown[], first?: unknown, second?: unknown): unknown[] {
	return sortArray(array, getSorters(first, getModifier(first, second)));
}

function sortArray(array: unknown[], sorters: InternalSorter[]): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	const {length} = sorters;

	return array.length > 1
		? array.sort((first, second) => getComparisonValue(first, second, sorters, length))
		: array;
}

sort.index = getIndex;

sort.initialize = initializeSort;

sort.is = isSorted;

// #endregion

// #region Variables

const ARRAY_PEEK_PERCENTAGE = 10;

const ARRAY_THRESHOLD = 100;

export const SORT_DIRECTION_ASCENDING: SortDirection = 'ascending';

export const SORT_DIRECTION_DESCENDING: SortDirection = 'descending';

const modifiers: Record<SortDirection, number> = {
	[SORT_DIRECTION_ASCENDING]: 1,
	[SORT_DIRECTION_DESCENDING]: -1,
};

// #endregion
