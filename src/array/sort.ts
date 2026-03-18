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

/**
 * Internal sorter information
 */
type InternalSorter = {
	compare?: SorterCompare;
	get: boolean;
	identifier: string;
	modifier: number;
	value?: (item: PlainObject) => unknown;
};

/**
 * Direction to sort by
 */
export type SortDirection = 'ascending' | 'descending';

/**
 * Comparison callbacks for sorter
 */
type SorterCompare = {
	complex?: Function;
	simple?: Function;
};

/**
 * Sorter to use for sorting
 */
type Sorter<Item> = Item extends PlainObject
	?
			| keyof Item
			| ArrayComparisonSorter<Item>
			| ArrayKeySorters<Item>
			| ArrayValueSorter<Item>
			| ComparisonSorter<Item>
	: ArrayComparisonSorter<Item> | ArrayValueSorter<Item> | ComparisonSorter<Item>;

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

function getValueSorter(value: string | Function, modifier: number): InternalSorter {
	return {
		modifier,
		get: true,
		identifier: String(value),
		value:
			typeof value === 'function'
				? (value as (item: PlainObject) => unknown)
				: item => (item as PlainObject)[value],
	};
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
	sorters: Array<Sorter<Item>>,
	descending?: boolean,
): Item[];

/**
 * Sort an array of items, using multiple sorters to sort by specific values
 * @param array Array to sort
 * @param sorter Sorter to use for sorting
 * @param descending Sort in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Sorted array
 */
export function sort<Item>(array: Item[], sorter: Sorter<Item>, descending?: boolean): Item[];

/**
 * Sort an array of items
 * @param array Array to sort
 * @param descending Sort in descending order? _(defaults to `false`)_
 * @returns Sorted array
 */
export function sort<Item>(array: Item[], descending?: boolean): Item[];

export function sort(array: unknown[], first?: unknown, second?: unknown): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	if (array.length < 2) {
		return array;
	}

	const direction =
		first === true || second === true ? SORT_DIRECTION_DESCENDING : SORT_DIRECTION_ASCENDING;

	const modifier = modifiers[direction];

	const sorters = (Array.isArray(first) ? first : [first])
		.map(item => getSorter(item, modifier))
		.filter(sorter => sorter != null)
		.filter(
			(current, index, filtered) =>
				filtered.findIndex(next => next.identifier === current.identifier) === index,
		);

	const {length} = sorters;

	if (length === 0) {
		return array.sort((first, second) => compare(first, second) * modifier);
	}

	if (length === 1) {
		const sorter = sorters[0];

		return array.sort((firstItem, secondItem) => {
			const firstValue = sorter.get ? sorter.value!(firstItem as PlainObject) : firstItem;
			const secondValue = sorter.get ? sorter.value!(secondItem as PlainObject) : secondItem;

			return (
				(sorter.compare?.complex?.(firstItem, firstValue, secondItem, secondValue) ??
					sorter.compare?.simple?.(firstItem, secondItem) ??
					compare(firstValue, secondValue)) * sorter.modifier
			);
		});
	}

	return array.sort((firstItem, secondItem) => {
		for (let index = 0; index < length; index += 1) {
			const sorter = sorters[index];

			const firstValue = sorter.value?.(firstItem as PlainObject) ?? firstItem;
			const secondValue = sorter.value?.(secondItem as PlainObject) ?? secondItem;

			const comparison =
				(sorter.compare?.complex?.(firstItem, firstValue, secondItem, secondValue) ??
					sorter.compare?.simple?.(firstItem, secondItem) ??
					compare(firstValue, secondValue)) * sorter.modifier;

			if (comparison !== 0) {
				return comparison;
			}
		}

		return 0;
	});
}

// #endregion

// #region Variables

export const SORT_DIRECTION_ASCENDING: SortDirection = 'ascending';

export const SORT_DIRECTION_DESCENDING: SortDirection = 'descending';

const modifiers: Record<SortDirection, number> = {
	[SORT_DIRECTION_ASCENDING]: 1,
	[SORT_DIRECTION_DESCENDING]: -1,
};

// #endregion
