import {getString} from '../internal/string';
import {isPlainObject} from '../is';
import type {PlainObject, RequiredKeys} from '../models';
import {lowerCase} from './case';
import {includes} from './match';

// #region Types

/**
 * Fuzzy searcher for an array of items
 */
class Fuzzy<Item> {
	#state: FuzzyState<Item>;

	/**
	 * Get items currently being searched through
	 */
	get items(): Item[] {
		return this.#state.items.slice();
	}

	/**
	 * Set new items to search through
	 */
	set items(items: Item[]) {
		if (Array.isArray(items)) {
			this.#state.items = items.slice();
			this.#state.strings = items.map(this.#state.handler);
		}
	}

	/**
	 * Get strings currently being searched through _(the stringified version of `items`)_
	 */
	get strings(): string[] {
		return this.#state.strings.slice();
	}

	constructor(state: FuzzyState<Item>) {
		this.#state = state;
	}

	/**
	 * Search for items matching the given value
	 * @param value Value to search for
	 * @param options Search options
	 * @returns Search results, with exact matches _(ordered)_ and similar matches _(ordered by relevance)_
	 */
	search(value: string, options?: FuzzyOptions): FuzzyResult<Item>;

	/**
	 * Search for items matching the given value
	 * @param value Value to search for
	 * @param limit Maximum number of combined items to return in `exact` and `similar`
	 * @returns Search results, with exact matches _(ordered)_ and similar matches _(ordered by relevance)_
	 */
	search(value: string, limit: number): FuzzyResult<Item>;

	search(value: string, options?: number | FuzzyOptions): FuzzyResult<Item> {
		return search(
			this.#state.items,
			this.#state.strings,
			value,
			options == null ? this.#state : getFuzzyOptions(options, this.#state),
		);
	}
}

export type FuzzyConfiguration<Item> = {
	/**
	 * Handler to stringify items
	 *
	 * May be a function that takes an item and returns a string, or if items are plain objects, a key of the item to use to grab a string value from
	 *
	 * Defaults to `getString`
	 */
	handler?: (item: Item) => string;
} & (Item extends PlainObject
	? {
			/**
			 * Key to use to stringify items
			 *
			 * Prioritized over `handler`
			 */
			key?: keyof Item;
		}
	: {}) &
	FuzzyOptions;

type FuzzyItem<Item> = {
	item: Item;
	haystack: string;
};

export type FuzzyOptions = {
	/**
	 * Maximum number of combined items to return in `exact` and `similar` _(defaults to all matches)_
	 */
	limit?: number;
	/**
	 * Maximum score difference between the best and worst similar matches included in results; higher values cast a wider net _(defaults to 5)_
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

type FuzzyState<Item> = {
	handler: (item: Item) => string;
	items: Item[];
	limit?: number;
	strings: string[];
	tolerance: number;
};

// #endregion

// #region Functions

function getHandler<Item>(input: unknown): (item: Item) => string {
	if (input == null || input === getString) {
		return getString;
	}

	switch (typeof input) {
		case 'function':
			return input as (item: Item) => string;

		case 'string':
			return (item: Item) => (item as PlainObject)[input] as string;

		default: {
			if (isPlainObject(input)) {
				return getHandler(
					(input as FuzzyConfiguration<PlainObject>).key ??
						(input as FuzzyConfiguration<Item>).handler,
				);
			}

			throw new TypeError(MESSAGE_HANDLER);
		}
	}
}

function getItems<Item>(items: FuzzyItem<Item>[]): Item[] {
	return items
		.sort((first, second) => first.haystack.localeCompare(second.haystack))
		.map(({item}) => item);
}

function getFuzzyOptions<Item>(
	input: unknown,
	state?: FuzzyState<Item>,
): RequiredKeys<FuzzyOptions, 'tolerance'> {
	const options: FuzzyOptions = isPlainObject(input) ? input : {};

	const limit = typeof input === 'number' ? input : options.limit;

	if (typeof limit === 'number' && !Number.isNaN(limit) && limit >= 1) {
		options.limit = Math.floor(limit);
	} else {
		options.limit = state?.limit;
	}

	options.tolerance = getTolerance(options.tolerance, state);

	return options as RequiredKeys<FuzzyOptions, 'tolerance'>;
}

function getState<Item>(items: Item[], input: unknown): FuzzyState<Item> {
	const handler = getHandler(input);
	const options = getFuzzyOptions(input);

	return {
		handler,
		items: items.slice(),
		limit: options.limit,
		strings: items.map(handler),
		tolerance: options.tolerance,
	};
}

function getTolerance<Item>(input: unknown, state?: FuzzyState<Item>): number {
	if (typeof input === 'number' && !Number.isNaN(input)) {
		return input < 0 ? 0 : Math.floor(input);
	}

	return state?.tolerance ?? PROXIMITY_THRESHOLD;
}

/**
 * Create a fuzzy searcher for an array of items
 * @param items Items to search through
 * @param key Key to use to stringify items
 * @returns Fuzzy searcher
 */
export function fuzzy<Item extends PlainObject, ItemKey extends keyof Item>(
	items: Item[],
	key?: ItemKey,
): Fuzzy<Item>;

/**
 * Create a fuzzy searcher for an array of items
 * @param items Items to search through
 * @param handler Handler to stringify items
 * @returns Fuzzy searcher
 */
export function fuzzy<Item>(items: Item[], handler?: (item: Item) => string): Fuzzy<Item>;

/**
 * Create a fuzzy searcher for an array of items
 * @param items Items to search through
 * @param configuration Fuzzy configuration
 * @returns Fuzzy searcher
 */
export function fuzzy<Item>(items: Item[], configuration?: FuzzyConfiguration<Item>): Fuzzy<Item>;

export function fuzzy(items: unknown[], configuration?: unknown): Fuzzy<unknown> {
	if (!Array.isArray(items)) {
		throw new TypeError(MESSAGE_ARRAY);
	}

	return new Fuzzy(getState(items, configuration));
}

fuzzy.match = fuzzyMatch;

/**
 * Does the needle match the haystack in a fuzzy way?
 * @param haystack Haystack to search through
 * @param needle Needle to search for
 * @returns `true` if the needle matches the haystack in a fuzzy way, `false` otherwise
 */
export function fuzzyMatch(haystack: string, needle: string): boolean {
	if (typeof haystack !== 'string' || typeof needle !== 'string') {
		return false;
	}

	const trimmed = needle.trim();

	if (includes(haystack, trimmed, true)) {
		return true;
	}

	return getScore(haystack, trimmed) > -1;
}

function isSubsequence(haystack: string, needle: string): boolean {
	const lowerCaseHaystack = lowerCase(haystack);
	const lowerCaseNeedle = lowerCase(needle);

	const haystackLength = lowerCaseHaystack.length;
	const needleLength = lowerCaseNeedle.length;

	let needleIndex = 0;

	for (let haystackIndex = 0; haystackIndex < haystackLength; haystackIndex += 1) {
		// Advance needle pointer only on a matching character
		if (lowerCaseHaystack[haystackIndex] === lowerCaseNeedle[needleIndex]) {
			needleIndex += 1;
		}

		// All needle characters matched in order
		if (needleIndex === needleLength) {
			return true;
		}
	}

	return false;
}

function getScore(haystack: string, needle: string): number {
	if (!isSubsequence(haystack, needle)) {
		return -1;
	}

	const lowerCaseHaystack = lowerCase(haystack);
	const lowerCaseNeedle = lowerCase(needle);

	const needleLength = lowerCaseNeedle.length;

	let needleIndex = 0;
	let previousMatchIndex = -1;
	let score = 0;

	for (let haystackIndex = 0; haystackIndex < lowerCaseHaystack.length; haystackIndex += 1) {
		if (lowerCaseHaystack[haystackIndex] === lowerCaseNeedle[needleIndex]) {
			// +1 for each matched character
			score += 1;

			// Bonus for matching at the start of the string
			if (haystackIndex === 0) {
				score += 1;
			}

			// Proximity bonus: decays as gap between consecutive matches widens
			if (previousMatchIndex !== -1) {
				const gap = haystackIndex - previousMatchIndex - 1;

				score += Math.max(0, PROXIMITY_THRESHOLD - gap);
			}

			previousMatchIndex = haystackIndex;

			needleIndex += 1;
		}

		// All needle characters matched; no need to scan further
		if (needleIndex === needleLength) {
			break;
		}
	}

	// Penalty for longer strings to favour tighter matches
	score -= Math.floor(lowerCaseHaystack.length / LENGTH_DIVISOR);

	return Math.max(0, score);
}

function search<Item>(
	items: Item[],
	strings: string[],
	input: string,
	options: RequiredKeys<FuzzyOptions, 'tolerance'>,
) {
	const result: FuzzyResult<Item> = {
		exact: [],
		similar: [],
	};

	const value = typeof input === 'string' ? input.trim() : '';

	if (value.length === 0) {
		result.exact = items.slice(0, options.limit);

		return result;
	}

	let {length} = items;

	const exact: Array<FuzzyItem<Item>> = [];
	const similar: Array<Item> = [];

	const scored: Record<number, Array<FuzzyItem<Item>>> = {};

	for (let index = 0; index < length; index += 1) {
		const item = items[index];
		const haystack = strings[index];

		if (includes(haystack, value, true)) {
			exact.push({item, haystack});

			continue;
		}

		const score = getScore(haystack, value);

		if (score > -1) {
			scored[score] ??= [];

			scored[score].push({item, haystack});
		}
	}

	const keys = Object.keys(scored)
		.map(Number)
		.sort((first, second) => second - first);

	length = keys.length;

	if (length > 0 && options.tolerance > 0) {
		const maxScore = keys[0];

		for (let index = 0; index < length; index += 1) {
			const key = keys[index];

			if (maxScore - key > options.tolerance) {
				break;
			}

			similar.push(...getItems(scored[key]));
		}
	}

	result.exact = getItems(options.limit == null ? exact : exact.slice(0, options.limit));

	if (options.limit == null) {
		result.similar = similar;
	} else {
		result.similar = similar.slice(0, options.limit - result.exact.length);
	}

	return result;
}

// #endregion

// #region Variables

const LENGTH_DIVISOR = 3;

const MESSAGE_ARRAY = 'Fuzzy requires an array of items';

const MESSAGE_HANDLER = 'Fuzzy requires a key or function to stringify items';

const PROXIMITY_THRESHOLD = 5;

// #endregion
