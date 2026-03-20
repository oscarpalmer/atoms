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

export type Sorter<Item> = (array: Item[]) => Item[];

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
	const modifier = getModifier(first, second);
	const sorters = getSorters(first, modifier);

	return array => work(array, sorters, modifier);
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
	const modifier = getModifier(first, second);

	return work(array, getSorters(first, modifier), modifier);
}

function work(array: unknown[], sorters: InternalSorter[], modifier: number): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	if (array.length < 2) {
		return array;
	}

	const {length} = sorters;

	if (length === 0) {
		return array.sort((first, second) => compare(first, second) * modifier);
	}

	return array.sort((first, second) => {
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
	});
}

sort.initialize = initializeSort;

// #endregion

// #region Variables

export const SORT_DIRECTION_ASCENDING: SortDirection = 'ascending';

export const SORT_DIRECTION_DESCENDING: SortDirection = 'descending';

const modifiers: Record<SortDirection, number> = {
	[SORT_DIRECTION_ASCENDING]: 1,
	[SORT_DIRECTION_DESCENDING]: -1,
};

// #endregion
