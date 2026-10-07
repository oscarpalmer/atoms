import {
	ARRAY_INSERT_TYPE_INSERT,
	ARRAY_INSERT_TYPE_SPLICE,
	type ArrayInsertType,
} from '../../models/array/array.misc.model';
import {max, min} from '../math/aggregate';
import {chunk} from './chunk';

// #region Functions

function insertChunkedValues(
	type: ArrayInsertType,
	array: unknown[],
	items: unknown[],
	start: number,
	deleteCount: number,
): unknown {
	const actualDeleteCount = deleteCount < 0 ? 0 : deleteCount;
	const actualStart = min([max([0, start]), array.length]);
	const chunked = chunk(items);
	const lastIndex = chunked.length - 1;

	let index = chunked.length;
	let returned: unknown[] | undefined;

	while (index > 0) {
		index -= 1;

		const spliced = array.splice(
			actualStart,
			index === lastIndex ? actualDeleteCount : 0,
			...chunked[index],
		);

		if (returned == null) {
			returned = spliced;
		} else {
			returned.push(...spliced);
		}
	}

	if (type === ARRAY_INSERT_TYPE_INSERT) {
		return array;
	}

	return type === ARRAY_INSERT_TYPE_SPLICE ? returned : array.length;
}

export function insertValues(
	type: ArrayInsertType,
	array: unknown,
	items: unknown,
	start: unknown,
	deleteCount: number,
): unknown {
	const spliceArray = type === ARRAY_INSERT_TYPE_INSERT || type === ARRAY_INSERT_TYPE_SPLICE;

	if (
		!Array.isArray(array) ||
		typeof start !== 'number' ||
		!Array.isArray(items) ||
		items.length === 0
	) {
		return spliceArray ? [] : 0;
	}

	return insertChunkedValues(type, array, items, start, spliceArray ? deleteCount : 0);
}

// #endregion
