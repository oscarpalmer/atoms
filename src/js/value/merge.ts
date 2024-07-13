import {isArrayOrPlainObject} from '../is';
import type {ArrayOrPlainObject, PlainObject} from '../models';

/**
 * Merges multiple arrays or objects into a single one
 */
export function merge<Model extends ArrayOrPlainObject>(
	...values: Model[]
): Model {
	if (values.length === 0) {
		return {} as Model;
	}

	const actual = values.filter(value =>
		isArrayOrPlainObject(value),
	) as PlainObject[];

	const result = (actual.every(Array.isArray) ? [] : {}) as PlainObject;
	const {length} = actual;

	for (let outerIndex = 0; outerIndex < length; outerIndex += 1) {
		const item = actual[outerIndex];
		const keys = Object.keys(item);
		const size = keys.length;

		for (let innerIndex = 0; innerIndex < size; innerIndex += 1) {
			const key = keys[innerIndex];
			const next = item[key];
			const previous = result[key];

			if (isArrayOrPlainObject(next)) {
				result[key] = isArrayOrPlainObject(previous)
					? merge(previous, next)
					: merge(next);
			} else {
				result[key] = next;
			}
		}
	}

	return result as Model;
}
