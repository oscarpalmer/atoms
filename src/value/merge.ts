import {isArrayOrPlainObject} from '../is';
import type {ArrayOrPlainObject, PlainObject} from '../models';

type MergeOptions = {
	/**
	 * - Skip nullable values when merging arrays?
	 * - E.g. `merge([1, 2, 3], [null, null, 99])` => `[1, 2, 99]`
	 */
	skipNullable?: boolean;
};

/**
 * Merge multiple arrays or objects into a single one
 */
export function merge<Model extends ArrayOrPlainObject>(
	values: Model[],
	options?: Partial<MergeOptions>,
): Model {
	if (!Array.isArray(values) || values.length === 0) {
		return {} as Model;
	}

	const skipNullable = options?.skipNullable === true;

	const actual = values.filter(value => isArrayOrPlainObject(value)) as Model[];

	if (actual.length === 0) {
		return {} as Model;
	}

	if (actual.length === 1) {
		return actual[0];
	}

	const isArray = actual.every(Array.isArray);
	const result = (isArray ? [] : {}) as PlainObject;
	const {length} = actual;

	for (let outerIndex = 0; outerIndex < length; outerIndex += 1) {
		const item = actual[outerIndex] as PlainObject;
		const keys = Object.keys(item);
		const size = keys.length;

		for (let innerIndex = 0; innerIndex < size; innerIndex += 1) {
			const key = keys[innerIndex];
			const next = item[key];
			const previous = result[key];

			if (isArray && skipNullable && next == null) {
				continue;
			}

			if (isArrayOrPlainObject(next) && isArrayOrPlainObject(previous)) {
				result[key] = merge([previous, next], {skipNullable});
			} else {
				result[key] = next;
			}
		}
	}

	return result as Model;
}
