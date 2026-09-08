import type {NestedArray} from '../models';

// #region Functions

/**
 * Flatten an array _(using native `flat` and maximum depth)_
 *
 * @param array Array to flatten
 * @returns Flattened array
 *
 * @example
 * ```typescript
 * flatten([1, [2, [3, 4], 5], 6]); // => [1, 2, 3, 4, 5, 6]
 * ```
 */
export function flatten<Item>(array: Item[]): Array<NestedArray<Item>> {
	return (Array.isArray(array) ? array.flat(Number.POSITIVE_INFINITY) : []) as Array<NestedArray<Item>>;
}

// #endregion
