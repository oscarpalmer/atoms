import {insertValues} from '../internal/array/insert';

// Uses chunking to avoid call stack size being exceeded

/**
 * Insert items into an array _(at the end)_
 * @param array Original array
 * @param items Inserted items
 * @returns Updated array
 */
export function insert<Item>(array: Item[], items: Item[]): Item[];

/**
 * Insert items into an array at a specified index
 * @param array Original array
 * @param index Index to insert at
 * @param items Inserted items
 * @returns Updated array
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
