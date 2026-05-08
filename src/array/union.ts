import {COMPARE_SETS_UNION, compareSets} from '../internal/array/sets';

// #region Functions

/**
 * Get the combined, unique values from two arrays
 *
 * @param first First array
 * @param second Second array
 * @param callback Callback to get an item's value for comparison
 * @returns Combined, unique values from both arrays
 *
 * @example
 * ```typescript
 * union(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   [{id: 2}, {id: 4}],
 *   item => item.id,
 * ); // => [{id: 1}, {id: 2}, {id: 3}, {id: 4}]
 * ```
 */
export function union<First, Second>(
	first: First[],
	second: Second[],
	callback: (item: First | Second) => unknown,
): (First | Second)[];

/**
 * Get the combined, unique values from two arrays
 *
 * @param first First array
 * @param second Second array
 * @param key Key to get an item's value for comparison
 * @returns Combined, unique values from both arrays
 *
 * @example
 * ```typescript
 * union(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   [{id: 2}, {id: 4}],
 *   'id',
 * ); // => [{id: 1}, {id: 2}, {id: 3}, {id: 4}]
 * ```
 */
export function union<
	First extends Record<string, unknown>,
	Second extends Record<string, unknown>,
	SharedKey extends keyof First & keyof Second,
>(first: First[], second: Second[], key: SharedKey): (First | Second)[];

/**
 * Get the combined, unique values from two arrays
 *
 * @param first First array
 * @param second Second array
 * @returns Combined, unique values from both arrays
 *
 * @example
 * ```typescript
 * union(
 *   [1, 2, 3],
 *   [2, 4],
 * ); // => [1, 2, 3, 4]
 * ```
 */
export function union<First, Second>(first: First[], second: Second[]): (First | Second)[];

export function union(first: unknown[], second: unknown[], key?: unknown): unknown[] {
	return compareSets(COMPARE_SETS_UNION, first, second, key);
}

// #endregion
