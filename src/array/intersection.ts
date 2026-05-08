import {COMPARE_SETS_INTERSECTION, compareSets} from '../internal/array/sets';

// #region Functions

/**
 * Get the common values between two arrays
 *
 * @param first First array
 * @param second Second array
 * @param callback Callback to get an item's value for comparison
 * @returns Common values from both arrays
 *
 * @example
 * ```typescript
 * intersection(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   [{id: 2}, {id: 3}, {id: 4}],
 *   item => item.id,
 * ); // => [{id: 2}, {id: 3}]
 * ```
 */
export function intersection<First, Second>(
	first: First[],
	second: Second[],
	callback: (item: First | Second) => unknown,
): First[];

/**
 * Get the common values between two arrays
 *
 * @param first First array
 * @param second Second array
 * @param key Key to get an item's value for comparison
 * @returns Common values from both arrays
 *
 * @example
 * ```typescript
 * intersection(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   [{id: 2}, {id: 3}, {id: 4}],
 *   'id',
 * ); // => [{id: 2}, {id: 3}]
 * ```
 */
export function intersection<
	First extends Record<string, unknown>,
	Second extends Record<string, unknown>,
	SharedKey extends keyof First & keyof Second,
>(first: First[], second: Second[], key: SharedKey): First[];

/**
 * Get the common values between two arrays
 *
 * @param first First array
 * @param second Second array
 * @returns Common values from both arrays
 *
 * @example
 * ```typescript
 * intersection(
 *   [1, 2, 3],
 *   [2, 3, 4],
 * ); // => [2, 3]
 * ```
 */
export function intersection<First, Second>(first: First[], second: Second[]): First[];

export function intersection(first: unknown[], second: unknown[], key?: unknown): unknown[] {
	return compareSets(COMPARE_SETS_INTERSECTION, first, second, key);
}

// #endregion
