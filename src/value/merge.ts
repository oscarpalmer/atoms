import {isArrayOrPlainObject} from '../internal/is';
import type {ArrayOrPlainObject, NestedPartial, PlainObject, UnionToIntersection} from '../models';

// #region Types

/**
 * Options for assigning values
 */
export type AssignOptions = Omit<MergeOptions, 'assignValues'>;

export type Assigner = {
	/**
	 * Assign values from one or more objects to the first one
	 *
	 * @param to Value to assign to
	 * @param from Values to assign
	 * @returns Assigned value
	 */
	<To extends PlainObject, From extends PlainObject[]>(
		to: To,
		from: [...From],
	): To & UnionToIntersection<From[number]>;
};

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

export type Merger = {
	/**
	 * Merge multiple arrays or objects into a single one
	 *
	 * @param values Values to merge
	 * @returns Merged value
	 */
	<Values extends ArrayOrPlainObject[]>(
		values: NestedPartial<Values[number]>[],
	): UnionToIntersection<Values[number]>;
};

type Options = {
	assignValues: boolean;
	replaceableObjects: ReplaceableObjectsCallback | undefined;
	skipNullableAny: boolean;
	skipNullableInArrays: boolean;
};

type ReplaceableObjectsCallback = (name: string) => boolean;

// #endregion

// #region Functions

/**
 * Assign values from one or more objects to the first one
 *
 * @param to Value to assign to
 * @param from Values to assign
 * @param options Assigning options
 * @returns Assigned value
 */
export function assign<To extends PlainObject, From extends PlainObject[]>(
	to: To,
	from: [...From],
	options?: AssignOptions,
): To & UnionToIntersection<From[number]> {
	const actual = getMergeOptions(options);

	actual.assignValues = true;

	return mergeValues([to, ...from], actual) as To & UnionToIntersection<From[number]>;
}

assign.initialize = initializeAssigner;

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

/**
 * Create an assigner with predefined options
 *
 * Available as `initializeAssigner` and `assign.initialize`
 *
 * @param options Assigning options
 * @returns Assigner function
 */
export function initializeAssigner(options?: AssignOptions): Assigner {
	const actual = getMergeOptions(options);

	actual.assignValues = true;

	return ((to: PlainObject, from: PlainObject[]): PlainObject =>
		mergeValues([to, ...from], actual) as PlainObject) as Assigner;
}

/**
 * Create a merger with predefined options
 *
 * Available as `initializeMerger` and `merge.initialize`
 *
 * @param options Merging options
 * @returns Merger function
 */
export function initializeMerger(options?: MergeOptions): Merger {
	const actual = getMergeOptions(options);

	return ((values: NestedPartial<ArrayOrPlainObject>[]): ArrayOrPlainObject =>
		mergeValues(values, actual)) as Merger;
}

/**
 * Merge multiple arrays or objects into a single one
 *
 * @param values Values to merge
 * @param options Merging options
 * @returns Merged value
 */
export function merge<Values extends ArrayOrPlainObject[]>(
	values: [...Values],
	options?: MergeOptions,
): UnionToIntersection<Values[number]> {
	return mergeValues(values, getMergeOptions(options)) as UnionToIntersection<Values[number]>;
}

merge.initialize = initializeMerger;

function mergeObjects(
	values: ArrayOrPlainObject[],
	options: Options,
	destination?: ArrayOrPlainObject,
	prefix?: string,
): ArrayOrPlainObject {
	const {length} = values;

	const isArray = Array.isArray(destination ?? values[0]);
	const merged = (destination ?? (isArray ? [] : {})) as PlainObject;

	const offset = destination == null ? 0 : 1;

	for (let outerIndex = offset; outerIndex < length; outerIndex += 1) {
		const item = values[outerIndex] as PlainObject;
		const keys = Object.keys(item);
		const size = keys.length;

		for (let innerIndex = 0; innerIndex < size; innerIndex += 1) {
			const key = keys[innerIndex];

			const next = item[key];
			const previous = merged[key];

			if (next == null && (options.skipNullableAny || (isArray && options.skipNullableInArrays))) {
				continue;
			}

			const full =
				options.replaceableObjects == null ? undefined : prefix == null ? key : `${prefix}.${key}`;

			if (
				isArrayOrPlainObject(next) &&
				isArrayOrPlainObject(previous) &&
				!(options.replaceableObjects?.(full!) ?? false)
			) {
				merged[key] = mergeObjects(
					[previous, next],
					options,
					(destination == null ? undefined : merged[key]) as ArrayOrPlainObject,
					full,
				);
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
	prefix?: string,
): ArrayOrPlainObject {
	if (!Array.isArray(values)) {
		return {};
	}

	const actual = values.filter(isArrayOrPlainObject);

	if (actual.length === 0) {
		return {};
	}

	if (
		options.assignValues &&
		actual.length === 2 &&
		!Array.isArray(actual[0]) &&
		Object.keys(actual[0]).length === 0
	) {
		return Object.assign(actual[0], actual[1]);
	}

	if (actual.length > 1) {
		return mergeObjects(actual, options, options.assignValues ? actual[0] : undefined, prefix);
	}

	return options.assignValues
		? actual[0]
		: Array.isArray(actual[0])
			? actual[0].slice()
			: {...actual[0]};
}

// #endregion
