import {insertValues} from '../internal/array/insert';

// Uses chunking to avoid call stack size being exceeded

/**
 * Insert values into an array at the end
 * @param array Array to insert values into
 * @param items Values to insert into the array
 * @returns Original array with the values inserted
 */
export function insert<Item>(array: Item[], items: Item[]): Item[];

/**
 * Insert values into an array at a specified index
 * @param array Array to insert values into
 * @param index Index to insert the values at
 * @param items Values to insert into the array
 * @returns Original array with the values inserted
 */
export function insert<Item>(
	array: Item[],
	index: number,
	items: Item[],
): Item[];

export function insert(
	array: unknown[],
	indexOrItems: number | unknown[],
	items?: unknown[],
): unknown[] {
	return insertValues(
		'insert',
		array,
		items == null ? indexOrItems : items,
		typeof indexOrItems === 'number' ? indexOrItems : array?.length,
		0,
	) as unknown[];
}
