import {insertValues} from '../internal/array/insert';

/**
 * - Insert values into an array _(at the end)_
 * - _(Uses chunking to avoid call stack size being exceeded)_
 */
export function insert<Item>(array: Item[], items: Item[]): Item[];

/**
 * - Insert values into an array at a specified index
 * - _(Uses chunking to avoid call stack size being exceeded)_
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
