import type {PlainObject} from '../index';

// #region Types

/**
 * Fuzzy searcher for an array of items
 */
export type Fuzzy<Item> = {
	/**
	 * Get items currently being searched through
	 *
	 * @returns Original items
	 */
	get items(): Item[];

	/**
	 * Set new items to search through
	 *
	 * @param items New items to search through
	 */
	set items(items: Item[]);

	/**
	 * Get strings currently being searched through _(the stringified version of `items`)_
	 *
	 * @returns Stringified items
	 */
	get strings(): string[];

	/**
	 * Search for items matching the given value
	 *
	 * @param value Value to search for
	 * @param options Search options
	 * @returns Search results, with exact matches _(ordered)_ and similar matches _(ordered by relevance)_
	 */
	search(value: string, options?: FuzzyOptions): FuzzyResult<Item>;

	/**
	 * Search for items matching the given value
	 *
	 * @param value Value to search for
	 * @param limit Maximum number of combined items to return in `exact` and `similar`
	 * @returns Search results, with exact matches _(ordered)_ and similar matches _(ordered by relevance)_
	 */
	search(value: string, limit: number): FuzzyResult<Item>;
};

export type FuzzyConfiguration<Item> = {
	/**
	 * Handler to stringify items
	 *
	 * - May be a function that takes an item and returns a string, or if items are plain objects, a key of the item to use to grab a string value from
	 * - Defaults to `getString`
	 */
	handler?: (item: Item) => string;
} & (Item extends PlainObject
	? {
			/**
			 * Key to use to stringify items
			 *
			 * _Prioritized over `handler`_
			 */
			key?: keyof Item;
		}
	: {}) &
	FuzzyOptions;

export type FuzzyItem<Item> = {
	item: Item;
	haystack: string;
};

export type FuzzyOptions = {
	/**
	 * Maximum number of combined items to return in `exact` and `similar` _(defaults to all matches)_
	 */
	limit?: number;
	/**
	 * Maximum score difference between the best and worst similar matches included in results
	 *
	 * - Higher values cast a wider net
	 * - Defaults to `5`
	 */
	tolerance?: number;
};

/**
 * Search results from a fuzzy search, with exact and similar matches
 */
export type FuzzyResult<Item> = {
	/**
	 * Ordered items that exactly match the search value
	 */
	exact: Item[];
	/**
	 * Ordered items that are similar to the search value, ranked by relevance
	 */
	similar: Item[];
};

/**
 * Options for fuzzy searching
 */
export type FuzzySearchOptions = FuzzyOptions;

export type FuzzyState<Item> = {
	handler(item: Item): string;
	items: Item[];
	limit?: number;
	strings: string[];
	tolerance: number;
};

export type InternalFuzzy<Item = unknown> = {
	[FUZZY_SYMBOL]: FuzzyState<Item>;
} & Fuzzy<Item>;

// #endregion

// #region Variables

export const FUZZY_LENGTH_DIVISOR = 3;

export const FUZZY_MESSAGE_ARRAY = 'Fuzzy requires an array of items';

export const FUZZY_MESSAGE_HANDLER = 'Fuzzy requires a key or function to stringify items';

export const FUZZY_PROPERTY = '$fuzzy';

export const FUZZY_PROXIMITY_THRESHOLD = 5;

export const FUZZY_SYMBOL: unique symbol = Symbol(FUZZY_PROPERTY);

// #endregion
