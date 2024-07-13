import {chunk} from './chunk';
import type {InsertType} from './models';

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
	const chunked = chunk(values).reverse();
	const {length} = chunked;

	let returned: Value[] | undefined;

	for (let index = 0; index < length; index += 1) {
		const result = array.splice(
			start,
			index === 0 ? deleteCount : 0,
			...chunked[index],
		);

		if (returned == null) {
			returned = result;
		}
	}

	return type === 'splice' ? returned : array.length;
}
