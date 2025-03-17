import {insertValues} from './insert';

/**
 * Removes and returns all items from an array starting from a specific index
 */
export function splice<Item>(array: Item[], start: number): Item[];

/**
 * Removes and returns _(up to)_ a specific amount of items from an array, starting from a specific index
 */
export function splice<Item>(
	array: Item[],
	start: number,
	amount: number,
): Item[];

/**
 * - Splices values into an array and returns any removed values
 * - _(Uses chunking to avoid call stack size being exceeded)_
 */
export function splice<Item>(
	array: Item[],
	start: number,
	added: Item[],
): Item[];

/**
 * - Splices values into an array and returns any removed values
 * - _(Uses chunking to avoid call stack size being exceeded)_
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
