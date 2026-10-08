import {isPlainObject} from '../internal/is';
import {max} from '../internal/math/aggregate';
import {floor} from '../internal/math/misc';
import {lowerCase} from '../internal/string/case';
import {getString} from '../internal/string/misc';
import type {PlainObject, RequiredKeys} from '../models/index';
import {
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
	type FuzzyResult,
	type FuzzyState,
	type InternalFuzzy,
} from '../models/string/string.fuzzy.model';
import {includes} from './match';

// #region Instances

function Fuzzy(this: any, state: FuzzyState<unknown>): void {
	this[FUZZY_SYMBOL] = state;
}

Fuzzy.prototype[FUZZY_PROPERTY] = true;

Fuzzy.prototype.search = search;

Object.defineProperties(Fuzzy.prototype, {
	items: {
		enumerable: true,
		get: getFuzzyItems,
		set: setFuzzyItems,
	},
	strings: {
		enumerable: true,
		get: getFuzzyStrings,
	},
});

// #endregion

// #region Functions

function createFuzzyItems<Item>(items: Array<FuzzyItem<Item>>): Item[] {
	return items
		.sort((first, second) => first.haystack.localeCompare(second.haystack))
		.map(({item}) => item);
}

function createFuzzyOptions<Item>(
	input: unknown,
	state?: FuzzyState<Item>,
): RequiredKeys<FuzzyOptions, 'tolerance'> {
	const options: FuzzyOptions = isPlainObject(input) ? input : {};

	const limit = typeof input === 'number' ? input : options.limit;

	if (typeof limit === 'number' && !Number.isNaN(limit) && limit >= 1) {
		options.limit = floor(limit);
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
	return new Fuzzy(createFuzzyState(items, configuration));
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

function getFuzzyItems(this: InternalFuzzy): unknown[] {
	return this[FUZZY_SYMBOL].items.slice();
}

function getFuzzyStrings(this: InternalFuzzy): string[] {
	return this[FUZZY_SYMBOL].strings.slice();
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

				score += max([0, FUZZY_PROXIMITY_THRESHOLD - gap]);
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
	score -= floor(lowerCaseHaystack.length / FUZZY_LENGTH_DIVISOR);

	return max([0, score]);
}

function getTolerance<Item>(input: unknown, state?: FuzzyState<Item>): number {
	if (typeof input === 'number' && !Number.isNaN(input)) {
		return input < 0 ? 0 : floor(input);
	}

	return state?.tolerance ?? FUZZY_PROXIMITY_THRESHOLD;
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

function search<Item>(
	this: InternalFuzzy<Item>,
	input: string,
	option?: number | FuzzyOptions,
): FuzzyResult<Item> {
	const state = this[FUZZY_SYMBOL];

	const options = option == null ? state : createFuzzyOptions(option, state);

	const result: FuzzyResult<Item> = {
		exact: [],
		similar: [],
	};

	const value = typeof input === 'string' ? input.trim() : '';

	if (value.length === 0) {
		result.exact = state.items.slice(0, options.limit);

		return result;
	}

	let {length} = state.items;

	const exact: Array<FuzzyItem<Item>> = [];
	const similar: Array<Item> = [];

	const scored: Record<number, Array<FuzzyItem<Item>>> = {};

	for (let index = 0; index < length; index += 1) {
		const item = state.items[index];
		const haystack = state.strings[index];

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

			similar.push(...createFuzzyItems(scored[key]));
		}
	}

	result.exact = createFuzzyItems(options.limit == null ? exact : exact.slice(0, options.limit));

	if (options.limit == null) {
		result.similar = similar;
	} else {
		result.similar = similar.slice(0, options.limit - result.exact.length);
	}

	return result;
}

function setFuzzyItems(this: InternalFuzzy, value: unknown): void {
	if (!Array.isArray(value)) {
		throw new TypeError(FUZZY_MESSAGE_ARRAY);
	}

	const state = this[FUZZY_SYMBOL];

	state.items = value.slice();
	state.strings = value.map(item => state.handler(item));
}

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

export type {Fuzzy, FuzzyItem, FuzzyOptions, FuzzyResult};

// #endregion
