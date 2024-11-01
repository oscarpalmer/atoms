import {insertValues} from '~/array/insert';

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
 * - Uses chunking to avoid stack overflow
 */
export function splice<Item>(
	array: Item[],
	start: number,
	added: Item[],
): Item[];

/**
 * - Splices values into an array and returns any removed values
 * - Uses chunking to avoid stack overflow
 */
export function splice<Item>(
	array: Item[],
	start: number,
	amount: number,
	added: Item[],
): Item[];

export function splice(
	array: unknown[],
	start: number,
	first?: number | unknown[],
	second?: unknown[],
): unknown[] {
	const isArray = Array.isArray(first);

	return insertValues(
		'splice',
		array,
		isArray ? first : (second ?? []),
		start,
		isArray ? array.length : typeof first === 'number' && first > 0 ? first : 0,
	) as unknown[];
}
