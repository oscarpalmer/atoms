import {chunk} from './chunk';

//

type InsertType = 'insert' | 'push' | 'splice';

//

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

	while (--index >= 0) {
		const result = array.splice(
			actualStart,
			index === lastIndex ? actualDeleteCount : 0,
			...chunked[index],
		);

		if (returned == null) {
			returned = result;
		} else {
			returned.push(...result);
		}
	}

	if (type === 'insert') {
		return array;
	}

	return type === 'splice' ? returned : array.length;
}

export function insertValues(
	type: InsertType,
	array: unknown,
	items: unknown,
	start: unknown,
	deleteCount: number,
): unknown {
	const splice = type === 'insert' || type === 'splice';

	if (!Array.isArray(array) || typeof start !== 'number') {
		return splice ? [] : 0;
	}

	if (!Array.isArray(items) || items.length === 0) {
		return splice ? [] : 0;
	}

	return insertChunkedValues(type, array, items, start, splice ? deleteCount : 0);
}
