import {getArrayCallback} from './callbacks';

export function updateInArray(
	array: unknown[],
	items: unknown[],
	key: unknown,
	replace: boolean,
): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	const itemsIsArray = Array.isArray(items);

	if (array.length === 0 || !itemsIsArray) {
		if (itemsIsArray) {
			array.push(...items);
		}

		return array;
	}

	const {length} = items;

	if (length === 0) {
		return array;
	}

	const callback = getArrayCallback(key);

	for (let valuesIndex = 0; valuesIndex < length; valuesIndex += 1) {
		const item = items[valuesIndex];
		const value = callback?.(item) ?? item;

		const arrayIndex =
			callback == null
				? array.indexOf(value)
				: array.findIndex(
						(arrayItem, arrayIndex) => callback(arrayItem, arrayIndex, array) === value,
					);

		if (arrayIndex === -1) {
			array.push(item);
		} else if (replace) {
			array[arrayIndex] = item;
		} else {
			array.splice(arrayIndex, 1);
		}
	}

	return array;
}
