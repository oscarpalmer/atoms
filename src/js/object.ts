import {ArrayOrObject, GenericObject, isArrayOrObject} from './value';

/**
 * Clones any kind of value
 */
export function clone<T>(value: T): T {
	return structuredClone(value);
}

/**
 * Merges multiple arrays or objects into a single one
 */
export function merge<T = ArrayOrObject>(...values: T[]): T {
	if (values.length === 0) {
		return {} as T;
	}

	const actual = values.filter(isArrayOrObject) as GenericObject[];
	const result = (actual.every(Array.isArray) ? [] : {}) as GenericObject;

	const {length: itemsLength} = actual;

	let itemIndex = 0;

	for (; itemIndex < itemsLength; itemIndex += 1) {
		const item = actual[itemIndex];
		const isArray = Array.isArray(item);
		const keys = isArray ? undefined : Object.keys(item);

		const keysLength = isArray ? item.length : (keys as string[]).length;

		let keyIndex = 0;

		for (; keyIndex < keysLength; keyIndex += 1) {
			const key = keys?.[keyIndex] ?? keyIndex;
			const next = item[key];
			const previous = result[key];

			if (isArrayOrObject(previous) && isArrayOrObject(next)) {
				result[key] = merge(previous as never, next);
			} else {
				result[key] = next;
			}
		}
	}

	return result as T;
}
