import type {ArrayOrPlainObject, NestedPartial, PlainObject, UnionToIntersection} from '../index';

// #region Types

/**
 * Options for assigning values
 */
export type AssignOptions = BaseOptions;

type BaseOptions = {
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

export type InternalAssigner = {
	[MERGE_SYMBOL_ASSIGN]: MergingOptions;
} & Assigner;

export type InternalMerger = {
	[MERGE_SYMBOL_MERGE]: MergingOptions;
} & Merger;

/**
 * Options for merging values
 */
export type MergeOptions = {
	/**
	 * Assign values to the first array or object instead of creating a new one?
	 */
	assignValues?: boolean;
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

export type MergeReplaceableObjectsCallback = (name: string) => boolean;

export type MergingOptions = {
	assignValues: boolean;
	replaceableObjects: MergeReplaceableObjectsCallback | undefined;
	skipNullableAny: boolean;
	skipNullableInArrays: boolean;
};

// #endregion

// #region Variables

export const MERGE_SYMBOL_ASSIGN: unique symbol = Symbol('assign');

export const MERGE_SYMBOL_MERGE: unique symbol = Symbol('merge');

// #endregion
