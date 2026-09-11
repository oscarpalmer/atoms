import {isArrayOrPlainObject} from '../internal/is';
import type {ArrayOrPlainObject, NestedPartial, PlainObject, UnionToIntersection} from '../models';

// #region Types

/**
 * Options for assigning values
 */
export type AssignOptions = Omit<MergeOptions, 'assignValues'>;

/**
 * An assigner function for assigning values from one or more objects to the first one
 */
export type Assigner = {
	/**
	 * Assign values from one or more objects to the first one
	 *
	 * @param to Value to assign to
	 * @param from Values to assign
	 * @returns Assigned value
	 */
	assign<To extends PlainObject, From extends PlainObject[]>(
		to: To,
		from: [...From],
	): To & UnionToIntersection<From[number]>;
};

type InternalAssigner = {
	[MERGE_SYMBOL_ASSIGN]: Options;
} & Assigner;

type InternalMerger = {
	[MERGE_SYMBOL_MERGE]: Options;
} & Merger;

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
	 * merge([{items: [1, 2, 3]}, {items: [99]}]); // => {items: [99]}
	 * ```
	 */
	replaceableObjects?: string | RegExp | Array<string | RegExp>;
	/**
	 * Skip nullable values when merging objects?
	 *
	 * ```ts
	 * merge({a: 1, b: 2}, {b: null, c: 3}, {d: null}); // => {a: 1, b: 2, c: 3}
	 * ```
	 */
	skipNullableAny?: boolean;
	/**
	 * Skip nullable values when merging arrays?
	 *
	 * ```ts
	 * merge([1, 2, 3], [null, null, 99]); // => [1, 2, 99]
	 * ```
	 */
	skipNullableInArrays?: boolean;
};

/**
 * A merger function for merging multiple arrays or objects into a single one
 */
export type Merger = {
	/**
	 * Merge multiple arrays or objects into a single one
	 *
	 * @param values Values to merge
	 * @returns Merged value
	 */
	merge<Values extends ArrayOrPlainObject[]>(
		values: Array<NestedPartial<Values[number]>>,
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

// #region Instances

function Assigner(this: any, options: Options) {
	options.assignValues = true;

	this[MERGE_SYMBOL_ASSIGN] = options;
}

Object.defineProperties(Assigner.prototype, {
	assign: {
		value: assignFromAssigner,
	},
});

function Merger(this: any, options: Options) {
	this[MERGE_SYMBOL_MERGE] = options;
}

Object.defineProperties(Merger.prototype, {
	merge: {
		value: mergeFromMerger,
	},
});

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
	const actual = createMergeOptions(options);

	actual.assignValues = true;

	return mergeValues([to, ...from], actual) as To & UnionToIntersection<From[number]>;
}

function assignFromAssigner(this: InternalAssigner, to: PlainObject, from: PlainObject[]) {
	return mergeValues([to, ...from], this[MERGE_SYMBOL_ASSIGN]);
}

function createMergeOptions(options?: MergeOptions): Options {
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

	if (items.length === 0) {
		return undefined;
	}

	return (name: string) =>
		items.some(item => (typeof item === 'string' ? item === name : item.test(name)));
}

/**
 * Create an assigner with predefined options
 *
 * _Available as `initializeAssigner` and `assign.initialize`_
 *
 * @param options Assigning options
 * @returns Assigner function
 */
export function initializeAssigner(options?: AssignOptions): Assigner {
	// @ts-expect-error All good, no worries :-)
	return new Assigner(createMergeOptions(options));
}

/**
 * Create a merger with predefined options
 *
 * _Available as `initializeMerger` and `merge.initialize`_
 *
 * @param options Merging options
 * @returns Merger function
 */
export function initializeMerger(options?: MergeOptions): Merger {
	// @ts-expect-error All good, no worries :-)
	return new Merger(createMergeOptions(options));
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
	return mergeValues(values, createMergeOptions(options)) as UnionToIntersection<Values[number]>;
}

function mergeFromMerger(this: InternalMerger, values: ArrayOrPlainObject[]): ArrayOrPlainObject {
	return mergeValues(values, this[MERGE_SYMBOL_MERGE]);
}

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

// #region Variables

const MERGE_SYMBOL_ASSIGN = Symbol('assign');

const MERGE_SYMBOL_MERGE = Symbol('merge');

// #endregion

// #region Initialization

assign.initialize = initializeAssigner;
merge.initialize = initializeMerger;

Object.defineProperty(assign, 'initialize', {
	value: initializeAssigner,
});

Object.defineProperty(merge, 'initialize', {
	value: initializeMerger,
});

// #endregion
