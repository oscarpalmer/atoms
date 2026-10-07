import {insertValues} from '../internal/array/insert';
import {ARRAY_INSERT_TYPE_PUSH} from '../models/array/array.misc.model';

// #region Functions

/**
 * Push items into an array _(at the end)_
 *
 * _(Uses chunking to avoid call stack size being exceeded)_
 *
 * @param array Original array
 * @param pushed Pushed items
 * @returns New length of the array
 *
 * @example
 * ```typescript
 * push([1, 2, 3], [4, 5]); // => 5 (new length); array becomes [1, 2, 3, 4, 5]
 * ```
 */
export function push<Item>(array: Item[], pushed: Item[]): number {
	return insertValues(ARRAY_INSERT_TYPE_PUSH, array, pushed, array.length, 0) as number;
}

// #endregion

// #region Exports

export {push as append};

// #endregion
