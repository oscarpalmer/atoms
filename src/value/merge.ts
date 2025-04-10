import {isArrayOrPlainObject} from '../is';
import {min} from '../math';
import type {ArrayOrPlainObject, PlainObject} from '../models';

function getIndices(arrays: unknown[][]): string[] {
	return Array.from(
		{
			length: min(arrays.map(array => array.length)),
		},
		(_, index) => String(index),
	);
}

/**
 * Merge multiple arrays or objects into a single one
 */
export function merge<Model extends ArrayOrPlainObject>(
	values: Model[],
): Model {
	if (!Array.isArray(values) || values.length === 0) {
		return {} as Model;
	}

	const actual = values.filter(value => isArrayOrPlainObject(value)) as Model[];

	if (actual.length === 0) {
		return {} as Model;
	}

	if (actual.length === 1) {
		return actual[0];
	}

	const isArray = actual.every(Array.isArray);
	const result = (isArray ? [] : {}) as PlainObject;
	const indices = isArray ? getIndices(actual as unknown[][]) : undefined;
	const {length} = actual;

	for (let outerIndex = 0; outerIndex < length; outerIndex += 1) {
		const item = actual[outerIndex] as PlainObject;
		const keys = indices ?? Object.keys(item);
		const size = keys.length;

		for (let innerIndex = 0; innerIndex < size; innerIndex += 1) {
			const key = keys[innerIndex];
			const next = item[key];
			const previous = result[key];

			if (isArrayOrPlainObject(next) && isArrayOrPlainObject(previous)) {
				result[key] = merge([previous, next]);
			} else {
				result[key] = next;
			}
		}
	}

	return result as Model;
}
