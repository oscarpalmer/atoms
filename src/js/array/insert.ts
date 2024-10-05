import {chunk} from '@/array/chunk';
import type {InsertType} from '@/array/models';

/**
 * - Inserts values into an array at a specified index
 * - Uses chunking to avoid stack overflow
 */
export function insert<Value>(
	array: Value[],
	index: number,
	values: Value[],
): void {
	insertValues('splice', array, values, index, 0);
}

export function insertValues<Value>(
	type: InsertType,
	array: Value[],
	values: Value[],
	start: number,
	deleteCount: number,
): unknown {
	const chunked = chunk(values);
	const lastIndex = chunked.length - 1;

	let index = Number(chunked.length);
	let returned: Value[] | undefined;

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
