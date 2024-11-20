import {chunk} from './chunk';
import type {InsertType} from './models';

/**
 * - Insert values into an array _(at the end)_
 * - _(Uses chunking to avoid stack overflow_)
 */
export function insert<Item>(array: Item[], items: Item[]): void;

/**
 * - Insert values into an array at a specified index
 * - _(Uses chunking to avoid stack overflow_)
 */
export function insert<Item>(array: Item[], index: number, items: Item[]): void;

export function insert(
	array: unknown[],
	first: unknown,
	second?: unknown[],
): void {
	insertValues(
		'splice',
		array,
		Array.isArray(first) ? first : (second ?? []),
		typeof first === 'number' ? first : array.length,
		0,
	);
}

export function insertValues<Item>(
	type: InsertType,
	array: Item[],
	items: Item[],
	start: number,
	deleteCount: number,
): unknown {
	const chunked = chunk(items);
	const lastIndex = chunked.length - 1;

	let index = Number(chunked.length);
	let returned: Item[] | undefined;

	while (--index >= 0) {
		const result = array.splice(
			start,
			index === lastIndex ? deleteCount : 0,
			...chunked[index],
		);

		if (returned == null) {
			returned = result;
		}
	}

	return type === 'splice' ? returned : array.length;
}
