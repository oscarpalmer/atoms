import {chunk} from './chunk';

export function insertValues<Item>(
	type: 'insert' | 'push' | 'splice',
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

	const actualStart = Math.min(Math.max(0, start), array.length);
	const chunked = chunk(items);
	const lastIndex = chunked.length - 1;

	let index = Number(chunked.length);
	let returned: Item[] | undefined;

	while (--index >= 0) {
		const result = array.splice(
			actualStart,
			index === lastIndex ? (deleteCount < 0 ? 0 : deleteCount) : 0,
			...chunked[index],
		);

		if (returned == null) {
			returned = result;
		}
	}

	return type === 'insert'
		? array
		: type === 'splice'
			? returned
			: array.length;
}
