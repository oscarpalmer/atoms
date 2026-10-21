import {isPlainObject} from '../internal/is';
import {max} from '../internal/math/aggregate';
import {floor} from '../internal/math/misc';
import {lowerCase} from '../internal/string/case';
import {getString} from '../internal/string/misc';
import type {PlainObject} from '../models/index';
import {
	FUZZY_BOUNDARY_BONUS,
	FUZZY_BOUNDARY_SEPARATOR,
	FUZZY_LENGTH_DIVISOR,
	FUZZY_MESSAGE_ARRAY,
	FUZZY_MESSAGE_HANDLER,
	FUZZY_PROPERTY,
	FUZZY_PROXIMITY_THRESHOLD,
	FUZZY_SYMBOL,
	type Fuzzy,
	type FuzzyConfiguration,
	type FuzzyItem,
	type FuzzyOptions,
	type FuzzyRanked,
	type FuzzyResult,
	type FuzzyState,
	type FuzzyString,
	type InternalFuzzy,
} from '../models/string/string.fuzzy.model';

// #region Instances

function Fuzzy(this: InternalFuzzy, state: FuzzyState<unknown>): void {
	this[FUZZY_SYMBOL] = state;
}

Fuzzy.prototype[FUZZY_PROPERTY] = true;

Fuzzy.prototype.search = search;

Object.defineProperties(Fuzzy.prototype, {
	items: {
		enumerable: true,
		get: getItems,
		set: setItems,
	},
	strings: {
		enumerable: true,
		get: getStrings,
	},
});

// #endregion

// #region Functions

function compareItem<Item>(
	sorter: (first: string, second: string) => number,
): (first: FuzzyItem<Item>, second: FuzzyItem<Item>) => number {
	return (first: FuzzyItem<Item>, second: FuzzyItem<Item>) =>
		sorter(first.string.original, second.string.original);
}

function compareRanked<Item>(
	sorter: (first: string, second: string) => number,
): (first: FuzzyRanked<Item>, second: FuzzyRanked<Item>) => number {
	return (first: FuzzyRanked<Item>, second: FuzzyRanked<Item>) =>
		first.rank - second.rank ||
		first.position - second.position ||
		sorter(first.string.original, second.string.original);
}

function createItems<Item>(state: FuzzyState<Item>, items: Item[]): void {
	state.items.original = items.map(item => ({
		data: item,
		string: createString(state.handler(item)),
	}));

	state.items.sorted = undefined;
}

function createOptions<Item>(input: unknown, state?: FuzzyState<Item>): Required<FuzzyOptions> {
	const options: FuzzyOptions = {};

	const original = isPlainObject(input) ? input : {};

	const limit = typeof input === 'number' ? input : original.limit;

	if (typeof limit === 'number' && !Number.isNaN(limit) && limit >= 1) {
		options.limit = floor(limit);
	} else {
		options.limit = state?.limit ?? Number.POSITIVE_INFINITY;
	}

	options.tolerance = getTolerance(original.tolerance, state);

	return options as Required<FuzzyOptions>;
}

function createRanked<Item>(
	item: FuzzyItem<Item>,
	needle: string,
	position: number,
): FuzzyRanked<Item> {
	let boundary = position;

	// Prefer the first occurrence that starts a word, e.g. `map` in `bitmap-map`
	while (boundary > -1 && !isBoundary(item.string, boundary)) {
		boundary = item.string.lowercase.indexOf(needle, boundary + 1);
	}

	if (boundary === -1) {
		return {
			...item,
			position,
			rank: 2,
		};
	}

	return {
		...item,
		position: boundary,
		rank: boundary === 0 ? 0 : 1,
	};
}

function createState<Item>(items: Item[], input: unknown): FuzzyState<Item> {
	const handler = getHandler(input);
	const options = createOptions(input);
	const sorter = getComparator(input);

	const state = {
		compare: {
			item: compareItem(sorter),
			ranked: compareRanked(sorter),
		},
		handler,
		items: {
			original: [],
		},
		limit: options.limit,
		tolerance: options.tolerance,
	} satisfies FuzzyState<Item>;

	createItems(state, items);

	return state;
}

function createString(original: string): FuzzyString {
	return {
		original,
		lowercase: lowerCase(original),
	};
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

	// @ts-expect-error All good, no worries :-)
	return new Fuzzy(createState(items, configuration));
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

	const lowercaseHaystack = lowerCase(haystack);
	const lowercaseNeedle = lowerCase(trimmed);

	if (lowercaseHaystack.includes(lowercaseNeedle)) {
		return true;
	}

	return (
		getScore(
			{
				lowercase: lowercaseHaystack,
				original: haystack,
			},
			lowercaseNeedle,
		) > -1
	);
}

function getComparator(input: unknown): (first: string, second: string) => number {
	if (isPlainObject(input) && typeof input.compare === 'function') {
		return input.compare as (first: string, second: string) => number;
	}

	defaultSorter ??= Intl.Collator().compare;

	return defaultSorter;
}

function getHandler<Item>(input: unknown): (item: Item) => string {
	if (input == null || input === getString) {
		return getString;
	}

	switch (typeof input) {
		case 'function':
			return (item: Item) => getString(input(item));

		case 'number':
		case 'string':
		case 'symbol':
			return (item: Item) => getString((item as PlainObject)?.[input]);

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

function getItems(this: InternalFuzzy): unknown[] {
	return this[FUZZY_SYMBOL].items.original.map(item => item.data);
}

function getMatchEnd(haystack: string, needle: string, cursor: number): number {
	const haystackLength = haystack.length;
	const needleLength = needle.length;

	let needleIndex = 0;

	for (let index = cursor; index < haystackLength; index += 1) {
		if (haystack[index] === needle[needleIndex]) {
			needleIndex += 1;

			if (needleIndex === needleLength) {
				return index;
			}
		}
	}

	return -1;
}

function getResult<Item>(
	state: FuzzyState<Item>,
	exact: Array<FuzzyItem<Item>>,
	included: Array<FuzzyRanked<Item>>,
	scored: Record<number, Array<FuzzyItem<Item>>>,
	options: Required<FuzzyOptions> | FuzzyState<Item>,
): FuzzyResult<Item> {
	const result: FuzzyResult<Item> = {
		exact: [],
		included: [],
		similar: [],
	};

	exact.sort(state.compare.item);

	result.exact = exact.slice(0, options.limit).map(item => item.data);

	included.sort(state.compare.ranked);

	result.included = included.slice(0, options.limit - result.exact.length).map(item => item.data);

	const remaining = options.limit - result.exact.length - result.included.length;

	if (remaining === 0) {
		return result;
	}

	const keys = Object.keys(scored)
		.map(Number)
		.sort((first, second) => second - first);

	const keysLength = keys.length;

	if (keysLength === 0) {
		return result;
	}

	const maxScore = keys[0];

	outer: for (let index = 0; index < keysLength; index += 1) {
		const key = keys[index];

		if (maxScore - key > options.tolerance) {
			break;
		}

		const keyed = scored[key];
		const keyedLength = keyed.length;

		keyed.sort(state.compare.item);

		for (let keyedIndex = 0; keyedIndex < keyedLength; keyedIndex += 1) {
			result.similar.push(keyed[keyedIndex].data);

			if (result.similar.length >= remaining) {
				break outer;
			}
		}
	}

	return result;
}

function getScore(item: FuzzyString, needle: string): number {
	const haystackLength = item.lowercase.length;
	const needleLength = needle.length;

	if (needleLength > haystackLength) {
		return -1;
	}

	let best = -1;
	let cursor = 0;

	// Check each possible window of matches, keeping the best score
	while (cursor < haystackLength) {
		const end = getMatchEnd(item.lowercase, needle, cursor);

		if (end === -1) {
			break;
		}

		// Walk back from the end to find the tightest start for this window
		let index = end;
		let needleIndex = needleLength - 1;
		let next = -1;
		let score = 0;
		let start = end;

		// Safe, since all needle characters are known to exist between the cursor and the end
		while (needleIndex >= 0) {
			if (item.lowercase[index] === needle[needleIndex]) {
				// +1 for each matched character
				score += 1;

				// Proximity bonus: decays as gap between consecutive matches widens
				if (next !== -1) {
					score += max([0, FUZZY_PROXIMITY_THRESHOLD - (next - index - 1)]);
				}

				// Bonus for matching at the start of a word
				if (isBoundary(item, index)) {
					score += FUZZY_BOUNDARY_BONUS;
				}

				next = index;
				start = index;

				needleIndex -= 1;
			}

			index -= 1;
		}

		// Bonus for matching at the start of the string
		if (start === 0) {
			score += 1;
		}

		if (score > best) {
			best = score;
		}

		// Move past this window's start to look for a tighter one
		cursor = start + 1;
	}

	if (best === -1) {
		return -1;
	}

	// Penalty for longer strings to favour tighter matches
	return max([0, best - floor(haystackLength / FUZZY_LENGTH_DIVISOR)]);
}

function getStrings(this: InternalFuzzy): string[] {
	return this[FUZZY_SYMBOL].items.original.map(item => item.string.original);
}

function getTolerance<Item>(input: unknown, state?: FuzzyState<Item>): number {
	if (typeof input === 'number' && !Number.isNaN(input)) {
		return input < 0 ? 0 : floor(input);
	}

	return state?.tolerance ?? FUZZY_PROXIMITY_THRESHOLD;
}

function isBoundary(string: FuzzyString, index: number): boolean {
	if (index === 0 || FUZZY_BOUNDARY_SEPARATOR.test(string.lowercase[index - 1])) {
		return true;
	}

	// Lowercasing can change the length of some strings (e.g. `İ`), which misaligns indices
	if (string.original.length !== string.lowercase.length) {
		return false;
	}

	// Uppercase character after a non-uppercase character, e.g. the `B` in `fooBar`
	return (
		string.original[index] !== string.lowercase[index] &&
		string.original[index - 1] === string.lowercase[index - 1]
	);
}

/**
 * Is the value a fuzzy searcher?
 *
 * _Available as `isFuzzy` and `fuzzy.is`_
 *
 * @param value Value to check
 * @returns `true` if the value is a fuzzy searcher, otherwise `false`
 */
export function isFuzzy<Item = unknown>(value: unknown): value is Fuzzy<Item> {
	return (
		typeof value === 'object' &&
		value !== null &&
		FUZZY_PROPERTY in value &&
		value[FUZZY_PROPERTY] === true
	);
}

function search<Item>(
	this: InternalFuzzy<Item>,
	input: string,
	option?: number | FuzzyOptions,
): FuzzyResult<Item> {
	const state = this[FUZZY_SYMBOL];

	const options = option == null ? state : createOptions(option, state);

	const value = typeof input === 'string' ? input.trim() : '';

	const lowercaseValue = lowerCase(value);

	if (value.length === 0) {
		state.items.sorted ??= state.items.original.toSorted(state.compare.item);

		return {
			exact: state.items.sorted.slice(0, options.limit).map(item => item.data),
			included: [],
			similar: [],
		};
	}

	const exact: Array<FuzzyItem<Item>> = [];
	const included: Array<FuzzyRanked<Item>> = [];
	const scored: Record<number, Array<FuzzyItem<Item>>> = {};

	const {length} = state.items.original;

	for (let index = 0; index < length; index += 1) {
		const item = state.items.original[index];
		const {string} = item;

		if (string.lowercase === lowercaseValue) {
			exact.push(item);

			continue;
		}

		const position = string.lowercase.indexOf(lowercaseValue);

		if (position > -1) {
			included.push(createRanked(item, lowercaseValue, position));

			continue;
		}

		const score = getScore(string, lowercaseValue);

		if (score > -1) {
			scored[score] ??= [];

			scored[score].push(item);
		}
	}

	return getResult(state, exact, included, scored, options);
}

function setItems(this: InternalFuzzy, value: unknown): void {
	if (!Array.isArray(value)) {
		throw new TypeError(FUZZY_MESSAGE_ARRAY);
	}

	createItems(this[FUZZY_SYMBOL], value);
}

// #endregion

// #region Variables

let defaultSorter: (first: string, second: string) => number;

// #endregion

// #region Namespace

export declare namespace fuzzy {
	export var is: typeof isFuzzy;
	export var match: typeof fuzzyMatch;
}

// #endregion

// #region Initialization

fuzzy.is = isFuzzy;
fuzzy.match = fuzzyMatch;

// #endregion

// #region Exports

export type {Fuzzy, FuzzyOptions, FuzzyResult};

// #endregion
