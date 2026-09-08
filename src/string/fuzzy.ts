import {isPlainObject} from '../internal/is';
import {lowerCase} from '../internal/string/case';
import {getString} from '../internal/string/misc';
import type {PlainObject, RequiredKeys} from '../models';
import {includes} from './match';

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

type FuzzyState<Item> = {
	handler: (item: Item) => string;
	items: Item[];
	limit?: number;
	strings: string[];
	tolerance: number;
};

// #endregion

// #region Functions

function createFuzzyOptions<Item>(
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

function createFuzzyState<Item>(items: Item[], input: unknown): FuzzyState<Item> {
	const handler = getHandler(input);
	const options = createFuzzyOptions(input);

	return {
		handler,
		items: items.slice(),
		limit: options.limit,
		strings: items.map(handler),
		tolerance: options.tolerance,
	};
}

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

			throw new TypeError(FUZZY_MESSAGE_HANDLER);
		}
	}
}

function getFuzzyItems<Item>(items: Array<FuzzyItem<Item>>): Item[] {
	return items
		.sort((first, second) => first.haystack.localeCompare(second.haystack))
		.map(({item}) => item);
}

function getTolerance<Item>(input: unknown, state?: FuzzyState<Item>): number {
	if (typeof input === 'number' && !Number.isNaN(input)) {
		return input < 0 ? 0 : Math.floor(input);
	}

	return state?.tolerance ?? FUZZY_PROXIMITY_THRESHOLD;
}

/**
 * Create a fuzzy searcher for an array of items
 *
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
 *
 * @param items Items to search through
 * @param handler Handler to stringify items
 * @returns Fuzzy searcher
 */
export function fuzzy<Item>(items: Item[], handler?: (item: Item) => string): Fuzzy<Item>;

/**
 * Create a fuzzy searcher for an array of items
 *
 * @param items Items to search through
 * @param configuration Fuzzy configuration
 * @returns Fuzzy searcher
 */
export function fuzzy<Item>(items: Item[], configuration?: FuzzyConfiguration<Item>): Fuzzy<Item>;

export function fuzzy(items: unknown[], configuration?: unknown): Fuzzy<unknown> {
	if (!Array.isArray(items)) {
		throw new TypeError(FUZZY_MESSAGE_ARRAY);
	}

	const state = createFuzzyState(items, configuration);

	const instance: unknown = {
		search: (value: never, options?: never) =>
			search(
				state.items,
				state.strings,
				value,
				options == null ? state : createFuzzyOptions(options, state),
			),
	};

	Object.defineProperties(instance, {
		items: {
			enumerable: true,
			get: () => state.items.slice(),
			set: (value: never) => setItems(state, value),
		},
		strings: {
			enumerable: true,
			get: () => state.strings.slice(),
		},
	});

	return Object.freeze(instance) as Fuzzy<unknown>;
}

/**
 * Does the needle match the haystack in a fuzzy way?
 * 
 * _Available as `fuzzyMatch` and `fuzzy.match`_
 *
 * @param haystack Haystack to search through
 * @param needle Needle to search for
 * @returns `true` if the needle matches the haystack in a fuzzy way, otherwise `false`
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

				score += Math.max(0, FUZZY_PROXIMITY_THRESHOLD - gap);
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
	score -= Math.floor(lowerCaseHaystack.length / FUZZY_LENGTH_DIVISOR);

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

			similar.push(...getFuzzyItems(scored[key]));
		}
	}

	result.exact = getFuzzyItems(options.limit == null ? exact : exact.slice(0, options.limit));

	if (options.limit == null) {
		result.similar = similar;
	} else {
		result.similar = similar.slice(0, options.limit - result.exact.length);
	}

	return result;
}

function setItems(state: FuzzyState<unknown>, value: unknown): void {
	if (!Array.isArray(value)) {
		throw new TypeError(FUZZY_MESSAGE_ARRAY);
	}

	state.items = value.slice();
	state.strings = value.map(state.handler);
}

// #endregion

// #region Variables

const FUZZY_LENGTH_DIVISOR = 3;

const FUZZY_MESSAGE_ARRAY = 'Fuzzy requires an array of items';

const FUZZY_MESSAGE_HANDLER = 'Fuzzy requires a key or function to stringify items';

const FUZZY_PROXIMITY_THRESHOLD = 5;

// #endregion

// #region Initialization

fuzzy.match = fuzzyMatch;

Object.defineProperty(fuzzy, 'match', {
	value: fuzzyMatch,
});

// #endregion
