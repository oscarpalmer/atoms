import {insertValues} from '../internal/array/insert';

// Uses chunking to avoid call stack size being exceeded

/**
 * Removes and returns all items from an array starting from a specific index
 * @param array Original array
 * @param start Index to start splicing from
 * @returns Removed items
 */
export function splice<Item>(array: Item[], start: number): Item[];

/**
 * Removes and returns _(up to)_ a specific amount of items from an array, starting from a specific index
 * @param array Original array
 * @param start Index to start splicing from
 * @param amount Number of items to remove
 * @returns Removed items
 */
export function splice<Item>(
	array: Item[],
	start: number,
	amount: number,
): Item[];

/**
 * Adds items into an array at a specific index
 * @param array Original array
 * @param start Index to start splicing from
 * @param added Added items
 * @returns Removed items
 */
export function splice<Item>(
	array: Item[],
	start: number,
	added: Item[],
): Item[];

/**
 * Adds items into an array at a specific index and removes a specific amount of items
 * @param array Original array
 * @param start Index to start splicing from
 * @param amount Number of items to remove
 * @param added Added items
 * @returns Removed items
 */
export function splice<Item>(
	array: Item[],
	start: number,
	amount: number,
	added: Item[],
): Item[];

export function splice(
	array: unknown,
	start: unknown,
	deleteCountOrItems?: unknown,
	items?: unknown,
): unknown[] {
	return insertValues(
		'splice',
		array,
		typeof deleteCountOrItems === 'number' ? items : deleteCountOrItems,
		start,
		typeof deleteCountOrItems === 'number' ? deleteCountOrItems : 0,
	) as unknown[];
}
