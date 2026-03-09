import {chunk} from './chunk';

// #region Types

type InsertType = 'insert' | 'push' | 'splice';

// #endregion

// #region Functions

function insertChunkedValues(
	type: InsertType,
	array: unknown[],
	items: unknown[],
	start: number,
	deleteCount: number,
): unknown {
	const actualDeleteCount = deleteCount < 0 ? 0 : deleteCount;
	const actualStart = Math.min(Math.max(0, start), array.length);
	const chunked = chunk(items);
	const lastIndex = chunked.length - 1;

	let index = Number(chunked.length);
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

	if (type === INSERT_TYPE_INSERT) {
		return array;
	}

	return type === INSERT_TYPE_SPLICE ? returned : array.length;
}

export function insertValues(
	type: InsertType,
	array: unknown,
	items: unknown,
	start: unknown,
	deleteCount: number,
): unknown {
	const spliceArray = type === INSERT_TYPE_INSERT || type === INSERT_TYPE_SPLICE;

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

// #region Variables

export const INSERT_TYPE_INSERT: InsertType = 'insert';

export const INSERT_TYPE_PUSH: InsertType = 'push';

export const INSERT_TYPE_SPLICE: InsertType = 'splice';

// #endregion
