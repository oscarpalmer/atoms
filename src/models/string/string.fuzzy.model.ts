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
	 * @returns Search results, with exact, included, and similar matches
	 */
	search(value: string, options?: FuzzyOptions): FuzzyResult<Item>;

	/**
	 * Search for items matching the given value
	 *
	 * @param value Value to search for
	 * @param limit Maximum number of combined items to return in `exact`, `included`, and `similar`
	 * @returns Search results, with exact, included, and similar matches
	 */
	search(value: string, limit: number): FuzzyResult<Item>;
};

export type FuzzyConfiguration<Item> = {
	handler?: (item: Item) => string;
	/**
	 * Function to compare the stringified items for results _(defaults to `Intl.Collator().compare`)_
	 *
	 * @param first First string to compare
	 * @param second Second string to compare
	 * @returns Comparison result, similar to `Array.prototype.sort` callback
	 */
	compare?: (first: string, second: string) => number;
	/**
	 * Handler to stringify items
	 *
	 * - May be a function that takes an item and returns a string, or if items are plain objects, a key of the item to use to grab a string value from
	 * - Defaults to `getString`
	 */
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

export type FuzzyItem<Data> = {
	data: Data;
	string: FuzzyString;
};

export type FuzzyOptions = {
	/**
	 * Maximum number of combined items to return in `exact`, `included`, and `similar` _(defaults to all matches)_
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

export type FuzzyRanked<Data> = {
	position: number;
	/**
	 * `0` for starting with the value, `1` for the value starting a word, `2` for anything else
	 */
	rank: number;
} & FuzzyItem<Data>;

/**
 * Search results from a fuzzy search, with exact, included, and similar matches
 */
export type FuzzyResult<Item> = {
	/**
	 * Items whose strings exactly match the search value, ordered alphabetically
	 */
	exact: Item[];
	/**
	 * Items whose strings contain the search value, ordered alphabetically
	 */
	included: Item[];
	/**
	 * Items whose strings are similar to the search value, ranked by relevance, sorted by score, and ordered alphabetically within the same score
	 */
	similar: Item[];
};

/**
 * Options for fuzzy searching
 */
export type FuzzySearchOptions = {
	[Key in keyof FuzzyOptions]: FuzzyOptions[Key];
};

export type FuzzyState<Item> = {
	compare: FuzzyStateCompare<Item>;
	handler(item: Item): string;
	items: FuzzyStateItems<Item>;
	limit: number;
	tolerance: number;
};

type FuzzyStateCompare<Item = unknown> = {
	item: (first: FuzzyItem<Item>, second: FuzzyItem<Item>) => number;
	ranked: (first: FuzzyRanked<Item>, second: FuzzyRanked<Item>) => number;
};

type FuzzyStateItems<Item> = {
	original: Array<FuzzyItem<Item>>;
	sorted?: Array<FuzzyItem<Item>>;
};

export type FuzzyString = {
	lowercase: string;
	original: string;
};

export type InternalFuzzy<Item = unknown> = {
	[FUZZY_SYMBOL]: FuzzyState<Item>;
} & Fuzzy<Item>;

// #endregion

// #region Variables

export const FUZZY_BOUNDARY_BONUS = 2;

export const FUZZY_BOUNDARY_SEPARATOR: RegExp = /[\s./:\\_-]/;

export const FUZZY_LENGTH_DIVISOR = 3;

export const FUZZY_MESSAGE_ARRAY = 'Fuzzy requires an array of items';

export const FUZZY_MESSAGE_HANDLER = 'Fuzzy requires a key or function to stringify items';

export const FUZZY_PROPERTY = '$fuzzy';

export const FUZZY_PROXIMITY_THRESHOLD = 5;

export const FUZZY_SYMBOL: unique symbol = Symbol(FUZZY_PROPERTY);

// #endregion
