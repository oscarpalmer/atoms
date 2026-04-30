import {COMPARE_SETS_UNION, compareSets} from '../internal/array/sets';

// #region Functions

/**
 * Get the combined, unique values from two arrays
 * @param first First array
 * @param second Second array
 * @param callback Callback to get an item's value for comparison
 * @returns Combined, unique values from both arrays
 */
export function union<First, Second>(
	first: First[],
	second: Second[],
	callback: (item: First | Second) => unknown,
): (First | Second)[];

/**
 * Get the combined, unique values from two arrays
 * @param first First array
 * @param second Second array
 * @param key Key to get an item's value for comparison
 * @returns Combined, unique values from both arrays
 */
export function union<
	First extends Record<string, unknown>,
	Second extends Record<string, unknown>,
	SharedKey extends keyof First & keyof Second,
>(first: First[], second: Second[], key: SharedKey): (First | Second)[];

/**
 * Get the combined, unique values from two arrays
 * @param first First array
 * @param second Second array
 * @returns Combined, unique values from both arrays
 */
export function union<First, Second>(first: First[], second: Second[]): (First | Second)[];

export function union(first: unknown[], second: unknown[], key?: unknown): unknown[] {
	return compareSets(COMPARE_SETS_UNION, first, second, key);
}

// #endregion
