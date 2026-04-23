import {isArrayOrPlainObject} from '../internal/is';
import {join} from '../internal/string';
import type {ArrayOrPlainObject, NestedPartial, PlainObject} from '../models';

// #region Types

/**
 * Options for merging values
 */
export type MergeOptions = {
	/**
	 * Assign values to the first array or object instead of creating a new one?
	 */
	assignValues?: boolean;
	/**
	 * Key _(or key epxressions)_ for values that should be replaced
	 *
	 * ```ts
	 * merge([{items: [1, 2, 3]}, {items: [99]}]); // {items: [99]}
	 * ```
	 */
	replaceableObjects?: string | RegExp | Array<string | RegExp>;
	/**
	 * Skip nullable values when merging objects?
	 *
	 * ```ts
	 * merge({a: 1, b: 2}, {b: null, c: 3}, {d: null}); // {a: 1, b: 2, c: 3}
	 * ```
	 */
	skipNullableAny?: boolean;
	/**
	 * Skip nullable values when merging arrays?
	 *
	 * ```ts
	 * merge([1, 2, 3], [null, null, 99]); // [1, 2, 99]
	 * ```
	 */
	skipNullableInArrays?: boolean;
};

/**
 * Merge multiple arrays or objects into a single one
 * @param values Values to merge
 * @returns Merged value
 */
export type Merger<Model extends ArrayOrPlainObject = ArrayOrPlainObject> = (
	values: NestedPartial<Model>[],
) => Model;

type Options = {
	assignValues: boolean;
	replaceableObjects: ReplaceableObjectsCallback | undefined;
	skipNullableAny: boolean;
	skipNullableInArrays: boolean;
};

type ReplaceableObjectsCallback = (name: string) => boolean;

// #endregion

// #region Functions

function getMergeOptions(options?: MergeOptions): Options {
	const actual: Options = {
		assignValues: false,
		replaceableObjects: undefined,
		skipNullableAny: false,
		skipNullableInArrays: false,
	};

	if (typeof options !== 'object' || options == null) {
		return actual;
	}

	actual.replaceableObjects = getReplaceableObjects(options.replaceableObjects);

	actual.assignValues = options.assignValues === true;
	actual.skipNullableAny = options.skipNullableAny === true;
	actual.skipNullableInArrays = options.skipNullableInArrays === true;

	return actual;
}

function getReplaceableObjects(value: unknown): ReplaceableObjectsCallback | undefined {
	const items = (Array.isArray(value) ? value : [value]).filter(
		item => typeof item === 'string' || item instanceof RegExp,
	);

	if (items.length > 0) {
		return (name: string) =>
			items.some(item => (typeof item === 'string' ? item === name : item.test(name)));
	}
}

function handleMerge(values: ArrayOrPlainObject[], options: Options): ArrayOrPlainObject {
	return !Array.isArray(values) || values.length === 0 ? {} : mergeValues(values, options, true);
}

/**
 * Create a merger with predefined options
 *
 * Available as `initializeMerger` and `merge.initialize`
 * @param options Merging options
 * @returns Merger function
 */
export function initializeMerger(options?: MergeOptions): Merger {
	const actual = getMergeOptions(options);

	return <Model extends ArrayOrPlainObject>(values: NestedPartial<Model>[]): Model =>
		handleMerge(values, actual) as Model;
}

/**
 * Merge multiple arrays or objects into a single one
 * @param values Values to merge
 * @param options Merging options
 * @returns Merged value
 */
export function merge<Model extends ArrayOrPlainObject>(
	values: NestedPartial<Model>[],
	options?: MergeOptions,
): Model;

/**
 * Merge multiple arrays or objects into a single one
 * @param values Values to merge
 * @param options Merging options
 * @returns Merged value
 */
export function merge(
	values: NestedPartial<ArrayOrPlainObject>[],
	options?: MergeOptions,
): ArrayOrPlainObject;

export function merge(
	values: NestedPartial<ArrayOrPlainObject>[],
	options?: MergeOptions,
): ArrayOrPlainObject {
	return handleMerge(values, getMergeOptions(options));
}

merge.initialize = initializeMerger;

function mergeObjects(
	values: ArrayOrPlainObject[],
	options: Options,
	prefix?: string,
): ArrayOrPlainObject {
	const {length} = values;
	const isArray = values.every(Array.isArray);
	const merged = (options.assignValues ? values[0] : isArray ? [] : {}) as PlainObject;

	for (let outerIndex = 0; outerIndex < length; outerIndex += 1) {
		const item = values[outerIndex] as PlainObject;
		const keys = Object.keys(item);
		const size = keys.length;

		for (let innerIndex = 0; innerIndex < size; innerIndex += 1) {
			const key = keys[innerIndex];
			const full = join([prefix, key], '.');

			const next = item[key];
			const previous = merged[key];

			if (next == null && (options.skipNullableAny || (isArray && options.skipNullableInArrays))) {
				continue;
			}

			if (
				isArrayOrPlainObject(next) &&
				isArrayOrPlainObject(previous) &&
				!(options.replaceableObjects?.(full) ?? false)
			) {
				merged[key] = mergeValues([previous, next], options, false, full);
			} else {
				merged[key] = next;
			}
		}
	}

	return merged;
}

function mergeValues(
	values: ArrayOrPlainObject[],
	options: Options,
	validate: boolean,
	prefix?: string,
): ArrayOrPlainObject {
	const actual = validate ? values.filter(isArrayOrPlainObject) : values;

	return actual.length > 1 ? mergeObjects(actual, options, prefix) : (actual[0] ?? {});
}

// #endregion
