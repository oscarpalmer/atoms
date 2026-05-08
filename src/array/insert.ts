import {INSERT_TYPE_INSERT, insertValues} from '../internal/array/insert';

// #region Functions

/**
 * Insert items into an array at a specified index
 *
 * _(Uses chunking to avoid call stack size being exceeded)_
 *
 * @param array Original array
 * @param index Index to insert at
 * @param items Inserted items
 * @returns Updated array
 *
 * @example
 * ```typescript
 * insert([1, 2, 3], 1, [4, 5]); // => [1, 4, 5, 2, 3]
 * ```
 */
export function insert<Item>(array: Item[], index: number, items: Item[]): Item[];

/**
 * Insert items into an array _(at the end)_
 *
 * _(Uses chunking to avoid call stack size being exceeded)_
 *
 * @param array Original array
 * @param items Inserted items
 * @returns Updated array
 *
 * @example
 * ```typescript
 * insert([1, 2, 3], [4, 5]); // => [1, 2, 3, 4, 5]
 * ```
 */
export function insert<Item>(array: Item[], items: Item[]): Item[];

export function insert(
	array: unknown[],
	indexOrItems: number | unknown[],
	items?: unknown[],
): unknown[] {
	return insertValues(
		INSERT_TYPE_INSERT,
		array,
		items == null ? indexOrItems : items,
		typeof indexOrItems === 'number' ? indexOrItems : array?.length,
		0,
	) as unknown[];
}

// #endregion
