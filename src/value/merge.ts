import {isArrayOrPlainObject} from '../internal/is';
import {join} from '../internal/string';
import type {ArrayOrPlainObject, NestedPartial, PlainObject} from '../models';

/**
 * Options for merging values
 */
export type MergeOptions = {
	/**
	 * Key _(or key epxressions)_ for values that should be replaced
	 * ```ts
	 * merge([{items: [1, 2, 3]}, {items: [99]}]); // {items: [99]}
	 * ```
	 */
	replaceableObjects: string | RegExp | Array<string | RegExp>;
	/**
	 * Skip nullable values when merging arrays?
	 * ```ts
	 * merge([1, 2, 3], [null, null, 99]); // [1, 2, 99]
	 * ```
	 */
	skipNullableInArrays: boolean;
};

type MergeValuesOptions = {
	replaceableObjects: ReplaceableObjectsCallback | undefined;
	skipNullableInArrays: boolean;
};

type ReplaceableObjectsCallback = (name: string) => boolean;

function getReplaceableObjects(
	value: unknown,
): ReplaceableObjectsCallback | undefined {
	const items = (Array.isArray(value) ? value : [value]).filter(
		item => typeof item === 'string' || item instanceof RegExp,
	);

	if (items.length > 0) {
		return (name: string) =>
			items.some(item =>
				typeof item === 'string' ? item === name : item.test(name),
			);
	}
}

/**
 * Merge multiple arrays or objects into a single one
 * @param values Values to merge
 * @param options Options for merging
 * @returns Merged value
 */
export function merge<Model extends ArrayOrPlainObject>(
	values: NestedPartial<Model>[],
	options?: Partial<MergeOptions>,
): Model {
	if (!Array.isArray(values) || values.length === 0) {
		return {} as Model;
	}

	return mergeValues(values, {
		replaceableObjects: getReplaceableObjects(options?.replaceableObjects),
		skipNullableInArrays: options?.skipNullableInArrays === true,
	}) as Model;
}

function mergeValues(
	values: ArrayOrPlainObject[],
	options: MergeValuesOptions,
	prefix?: string,
): ArrayOrPlainObject {
	const actual = values.filter(isArrayOrPlainObject);

	if (actual.length === 0) {
		return {};
	}

	if (actual.length === 1) {
		return actual[0];
	}

	const {length} = actual;
	const isArray = actual.every(Array.isArray);
	const result = (isArray ? [] : {}) as PlainObject;

	for (let outerIndex = 0; outerIndex < length; outerIndex += 1) {
		const item = actual[outerIndex] as PlainObject;
		const keys = Object.keys(item);
		const size = keys.length;

		for (let innerIndex = 0; innerIndex < size; innerIndex += 1) {
			const key = keys[innerIndex];
			const full = join([prefix, key], '.');

			const next = item[key];
			const previous = result[key];

			if (isArray && options.skipNullableInArrays && next == null) {
				continue;
			}

			if (
				!isArrayOrPlainObject(next) ||
				!isArrayOrPlainObject(previous) ||
				(options.replaceableObjects?.(full) ?? false)
			) {
				result[key] = next;
			} else {
				result[key] = mergeValues([previous, next], options, full);
			}
		}
	}

	return result;
}
