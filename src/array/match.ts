import {getArrayCallback} from '../internal/array/callbacks';
import type {PlainObject} from '../models';

// #region Types

/**
 * Comparison of an array within another array
 */
export type ArrayComparison = 'end' | 'inside' | 'invalid' | 'outside' | 'same' | 'start';

// #endregion

// #region Functions

/**
 * Does the needle array end the haystack array?
 * @param haystack Haystack array
 * @param needle Needle array
 * @param key Key to get an item's value for matching
 * @return `true` if the haystack ends with the needle, otherwise `false`
 */
export function endsWithArray<Item extends PlainObject>(
	haystack: Item[],
	needle: Item[],
	key: keyof Item,
): boolean;

/**
 * Does the needle array end the haystack array?
 * @param haystack Haystack array
 * @param needle Needle array
 * @param callback Callback to get an item's value for matching
 * @return `true` if the haystack ends with the needle, otherwise `false`
 */
export function endsWithArray<Item>(
	haystack: Item[],
	needle: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
): boolean;

/**
 * Does the needle array end the haystack array?
 * @param haystack Haystack array
 * @param needle Needle array
 * @return `true` if the haystack ends with the needle, otherwise `false`
 */
export function endsWithArray<Item>(haystack: Item[], needle: Item[]): boolean;

export function endsWithArray(haystack: unknown[], needle: unknown[], key?: unknown): boolean {
	return endings.has(getPosition(haystack, needle, key)[1]);
}

/**
 * Get the position of an array within another array
 * @param haystack Haystack array
 * @param needle Needle array
 * @param key Key to get an item's value for matching
 * @returns Position of the needle within the haystack
 */
export function getArrayComparison<Item extends PlainObject>(
	haystack: Item[],
	needle: Item[],
	key: keyof Item,
): ArrayComparison;

/**
 * Get the position of an array within another array
 * @param haystack Haystack array
 * @param needle Needle array
 * @param callback Callback to get an item's value for matching
 * @returns Position of the needle within the haystack
 */
export function getArrayComparison<Item>(
	haystack: Item[],
	needle: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
): ArrayComparison;

/**
 * Get the position of an array within another array
 * @param haystack Haystack array
 * @param needle Needle array
 * @returns Position of the needle within the haystack
 */
export function getArrayComparison<Item>(haystack: Item[], needle: Item[]): ArrayComparison;

export function getArrayComparison(
	haystack: unknown[],
	needle: unknown[],
	key?: unknown,
): ArrayComparison {
	return getPosition(haystack, needle, key)[1];
}

function getName(start: number, haystack: number, needle: number): ArrayComparison {
	if (start === 0) {
		return haystack === needle ? COMPARISON_SAME : COMPARISON_START;
	}

	return start + needle === haystack ? COMPARISON_END : COMPARISON_INSIDE;
}

function getPosition(
	haystack: unknown[],
	needle: unknown[],
	key?: unknown,
): readonly [number, ArrayComparison] {
	if (!Array.isArray(haystack) || !Array.isArray(needle)) {
		return invalid;
	}

	const haystackLength = haystack.length;
	const needleLength = needle.length;

	if (haystackLength === 0 || needleLength === 0) {
		return outside;
	}

	if (needleLength > haystackLength) {
		return outside;
	}

	const callback = getArrayCallback(key);

	const limit = haystackLength - needleLength + 1;

	let needleValues = callback == null ? needle : needle.slice();

	if (callback != null) {
		for (let needleIndex = 0; needleIndex < needleLength; needleIndex += 1) {
			needleValues[needleIndex] = callback(needle[needleIndex], needleIndex, needle);
		}
	}

	for (let haystackIndex = 0; haystackIndex < limit; haystackIndex += 1) {
		let haystackItem = haystack[haystackIndex];
		let haystackValue = callback?.(haystackItem, haystackIndex, haystack) ?? haystackItem;

		if (!Object.is(haystackValue, needleValues[0])) {
			continue;
		}

		if (needleLength === 1) {
			return [haystackIndex, getName(haystackIndex, haystackLength, needleLength)];
		}

		for (let needleIndex = 1; needleIndex < needleLength; needleIndex += 1) {
			haystackItem = haystack[haystackIndex + needleIndex];

			haystackValue =
				callback?.(haystackItem, haystackIndex + needleIndex, haystack) ?? haystackItem;

			if (!Object.is(haystackValue, needleValues[needleIndex])) {
				break;
			}

			if (needleIndex === needleLength - 1) {
				return [haystackIndex, getName(haystackIndex, haystackLength, needleLength)];
			}
		}
	}

	return outside;
}

/**
 * Does the needle array exist within the haystack array?
 * @param haystack Haystack array
 * @param needle Needle array
 * @param key Key to get an item's value for matching
 * @return `true` if the haystack includes the needle, otherwise `false`
 */
export function includesArray<Item extends PlainObject>(
	haystack: Item[],
	needle: Item[],
	key: keyof Item,
): boolean;

/**
 * Does the needle array exist within the haystack array?
 * @param haystack Haystack array
 * @param needle Needle array
 * @param callback Callback to get an item's value for matching
 * @return `true` if the haystack includes the needle, otherwise `false`
 */
export function includesArray<Item>(
	haystack: Item[],
	needle: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
): boolean;

/**
 * Does the needle array exist within the haystack array?
 * @param haystack Haystack array
 * @param needle Needle array
 * @return `true` if the haystack includes the needle, otherwise `false`
 */
export function includesArray<Item>(haystack: Item[], needle: Item[]): boolean;

export function includesArray(haystack: unknown[], needle: unknown[], key?: unknown): boolean {
	return !outsides.has(getPosition(haystack, needle, key)[1]);
}

/**
 * Get the index of an array within another array
 * @param haystack Haystack array
 * @param needle Needle array
 * @param key Key to get an item's value for matching
 * @return Index of the needle's start within the haystack, or `-1` if it is not found
 */
export function indexOfArray<Item extends PlainObject>(
	haystack: Item[],
	needle: Item[],
	key: keyof Item,
): number;

/**
 * Get the index of an array within another array
 * @param haystack Haystack array
 * @param needle Needle array
 * @param callback Callback to get an item's value for matching
 * @return Index of the needle's start within the haystack, or `-1` if it is not found
 */
export function indexOfArray<Item>(
	haystack: Item[],
	needle: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
): number;

/**
 * Get the index of an array within another array
 * @param haystack Haystack array
 * @param needle Needle array
 * @return Index of the needle's start within the haystack, or `-1` if it is not found
 */
export function indexOfArray<Item>(haystack: Item[], needle: Item[]): number;

export function indexOfArray(haystack: unknown[], needle: unknown[], key?: unknown): number {
	return getPosition(haystack, needle, key)[0];
}

/**
 * Does the needle array start the haystack array?
 * @param haystack Haystack array
 * @param needle Needle array
 * @param key Key to get an item's value for matching
 * @return `true` if the haystack starts with the needle, otherwise `false`
 */
export function startsWithArray<Item extends PlainObject>(
	haystack: Item[],
	needle: Item[],
	key: keyof Item,
): boolean;

/**
 * Does the needle array start the haystack array?
 * @param haystack Haystack array
 * @param needle Needle array
 * @param callback Callback to get an item's value for matching
 * @return `true` if the haystack starts with the needle, otherwise `false`
 */
export function startsWithArray<Item>(
	haystack: Item[],
	needle: Item[],
	callback: (item: Item, index: number, array: Item[]) => unknown,
): boolean;

/**
 * Does the needle array start the haystack array?
 * @param haystack Haystack array
 * @param needle Needle array
 * @return `true` if the haystack starts with the needle, otherwise `false`
 */
export function startsWithArray<Item>(haystack: Item[], needle: Item[]): boolean;

export function startsWithArray(haystack: unknown[], needle: unknown[], key?: unknown): boolean {
	return starts.has(getPosition(haystack, needle, key)[1]);
}

// #endregion

// #region Variables

const COMPARISON_END: ArrayComparison = 'end';

const COMPARISON_INSIDE: ArrayComparison = 'inside';

const COMPARISON_INVALID: ArrayComparison = 'invalid';

const COMPARISON_OUTSIDE: ArrayComparison = 'outside';

const COMPARISON_SAME: ArrayComparison = 'same';

const COMPARISON_START: ArrayComparison = 'start';

const endings = new Set<ArrayComparison>([COMPARISON_END, COMPARISON_SAME]);

const invalid = [-1, COMPARISON_INVALID] as const;

const outside = [-1, COMPARISON_OUTSIDE] as const;

const outsides = new Set<ArrayComparison>([COMPARISON_INVALID, COMPARISON_OUTSIDE]);

const starts = new Set<ArrayComparison>([COMPARISON_START, COMPARISON_SAME]);

// #endregion
