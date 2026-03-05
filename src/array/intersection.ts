import {COMPARE_SETS_INTERSECTION, compareSets} from '../internal/array/sets';

/**
 * Get the common values between two arrays
 * @param first First array
 * @param second Second array
 * @param callback Callback to get an item's value for comparison
 * @returns Common values from both arrays
 */
export function intersection<First, Second>(
	first: First[],
	second: Second[],
	callback: (item: First | Second) => unknown,
): First[];

/**
 * Get the common values between two arrays
 * @param first First array
 * @param second Second array
 * @param key Key to get an item's value for comparison
 * @returns Common values from both arrays
 */
export function intersection<
	First extends Record<string, unknown>,
	Second extends Record<string, unknown>,
	Key extends keyof First & keyof Second,
>(first: First[], second: Second[], key: Key): First[];

/**
 * Get the common values between two arrays
 * @param first First array
 * @param second Second array
 * @returns Common values from both arrays
 */
export function intersection<First, Second>(first: First[], second: Second[]): First[];

export function intersection(first: unknown[], second: unknown[], key?: unknown): unknown[] {
	return compareSets(COMPARE_SETS_INTERSECTION, first, second, key);
}
