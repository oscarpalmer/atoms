import type {PlainObject, Primitive} from '../index';

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
export type ArrayKeySorters<Item extends PlainObject> = {
	[ItemKey in keyof Item]: ArrayKeySorter<Item, ItemKey>;
}[keyof Item];

/**
 * Sorter to use for sorting
 */
export type ArraySorter<Item> = Item extends PlainObject
	?
			| keyof Item
			| ArrayComparisonSorter<Item>
			| ArrayKeySorters<Item>
			| ArrayValueSorter<Item>
			| ComparisonSorter<Item>
	: ArrayComparisonSorter<Item> | ArrayValueSorter<Item> | ComparisonSorter<Item>;

/**
 * Sorters to use for sorting
 */
export type ArraySorters<Item> = Array<ArraySorter<Item>>;

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
	value(item: Item): unknown;
};

/**
 * Comparator to use when comparing items and values
 */
export type CompareCallback<Item, Value = CompareCallbackValue<Item>> = (
	first: Item,
	firstValue: Value,
	second: Item,
	secondValue: Value,
) => number;

export type CompareCallbackValue<Item> = Item extends Primitive ? Item : unknown;

/**
 * Callback to use when comparing items and values
 */
export type ComparisonSorter<Item> = (first: Item, second: Item) => number;

export type InternalSorter = {
	[SORTER_SYMBOL]: SortHandler[];
};

/**
 * Direction to sort by
 */
export type SortDirection = 'ascending' | 'descending';

export type SortHandler = {
	comparison?: SortHandlerComparison;
	get: boolean;
	identifier: string;
	modifier: number;
	value?: Function;
};

export type SortHandlerComparison = {
	complex?: Function;
	simple?: Function;
};

/**
 * Sorter for an array with predefined sorters
 *
 * Can be used to sort an array, get the predicted index for an item, and check if an array is sorted
 */
export type Sorter<Item> = {
	/**
	 * Get the index for an item _(to be inserted into an array of items)_
	 *
	 * _(If the array is not sorted, it will be treated as sorted, and the result may be inaccurate)_
	 *
	 * @param array Array to get the index from
	 * @param item Item to get the index for
	 * @returns Index for item
	 */
	index(array: Item[], item: Item): number;

	/**
	 * Is the array sorted?
	 *
	 * @param array Array to check
	 * @returns `true` if sorted, otherwise `false`
	 */
	is(array: Item[]): boolean;

	/**
	 * Sort an array of items
	 *
	 * @param array Array to sort
	 * @returns Sorted array
	 */
	sort(array: Item[]): Item[];
};

// #endregion

// #region Variables

export const SORT_PEEK_PERCENTAGE = 10;

export const SORT_THRESHOLD = 100;

export const SORT_DIRECTION_ASCENDING: SortDirection = 'ascending';

export const SORT_DIRECTION_DESCENDING: SortDirection = 'descending';

export const SORTER_SYMBOL: unique symbol = Symbol('sorter');

export const arrayModifiers: Record<string, number> = {
	[SORT_DIRECTION_ASCENDING]: 1,
	[SORT_DIRECTION_DESCENDING]: -1,
};

// #endregion
