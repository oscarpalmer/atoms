import {INSERT_TYPE_SPLICE, insertValues} from '../internal/array/insert';

// #region Functions

/**
 * Adds items into an array at a specific index and removes a specific amount of items
 *
 * _(Uses chunking to avoid call stack size being exceeded)_
 *
 * @param array Original array
 * @param start Index to start splicing from
 * @param amount Number of items to remove
 * @param added Added items
 * @returns Removed items
 *
 * @example
 * ```typescript
 * splice(
 *   [1, 2, 3, 4, 5],
 *   2,
 *   2,
 *   [6, 7]
 * ); // => [3, 4], array becomes [1, 2, 6, 7, 5]
 * ```
 */
export function splice<Item>(array: Item[], start: number, amount: number, added: Item[]): Item[];

/**
 * Adds items into an array at a specific index
 *
 * _(Uses chunking to avoid call stack size being exceeded)_
 *
 * @param array Original array
 * @param start Index to start splicing from
 * @param added Added items
 * @returns Removed items
 *
 * @example
 * ```typescript
 * splice(
 *   [1, 2, 3, 4, 5],
 *   2,
 *   [6, 7]
 * ); // => [], array becomes [1, 2, 6, 7, 3, 4, 5]
 * ```
 */
export function splice<Item>(array: Item[], start: number, added: Item[]): Item[];

/**
 * Removes and returns _(up to)_ a specific amount of items from an array, starting from a specific index
 *
 * _(Uses chunking to avoid call stack size being exceeded)_
 *
 * @param array Original array
 * @param start Index to start splicing from
 * @param amount Number of items to remove
 * @returns Removed items
 *
 * @example
 * ```typescript
 * splice(
 *   [1, 2, 3, 4, 5],
 *   2,
 *   2,
 * ); // => [3, 4], array becomes [1, 2, 5]
 * ```
 */
export function splice<Item>(array: Item[], start: number, amount: number): Item[];

/**
 * Removes and returns all items from an array starting from a specific index
 *
 * _(Uses chunking to avoid call stack size being exceeded)_
 *
 * @param array Original array
 * @param start Index to start splicing from
 * @returns Removed items
 *
 * @example
 * ```typescript
 * splice(
 *   [1, 2, 3, 4, 5],
 *   2,
 * ); // => [3, 4, 5], array becomes [1, 2]
 * ```
 */
export function splice<Item>(array: Item[], start: number): Item[];

export function splice(
	array: unknown,
	start: unknown,
	deleteCountOrItems?: unknown,
	items?: unknown,
): unknown[] {
	const deleteCountIsNumber = typeof deleteCountOrItems === 'number';

	return insertValues(
		INSERT_TYPE_SPLICE,
		array,
		deleteCountIsNumber ? items : deleteCountOrItems,
		start,
		deleteCountIsNumber ? deleteCountOrItems : 0,
	) as unknown[];
}

// #endregion
