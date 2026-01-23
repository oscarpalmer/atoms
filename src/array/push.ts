import {insertValues} from '../internal/array/insert';

// #region Functions

// Uses chunking to avoid call stack size being exceeded

/**
 * Push items into an array _(at the end)_
 * @param array Original array
 * @param pushed Pushed items
 * @returns New length of the array
 */
export function push<Item>(array: Item[], pushed: Item[]): number {
	return insertValues('push', array, pushed, array.length, 0) as number;
}

// #endregion
