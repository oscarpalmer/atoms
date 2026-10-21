import type {GenericCallback} from '../index';

// #region Types

export type ArrayCompareSetsType = 'difference' | 'intersection' | 'union';

/**
 * Comparison of an array within another array
 */
export type ArrayComparison = 'end' | 'inside' | 'invalid' | 'outside' | 'same' | 'start';

export type ArrayExtractType = 'drop' | 'take';

export type ArrayFlattened<Value> = Value extends ReadonlyArray<infer Inner> ? Inner : Value;

export type ArrayGetCallbacks = {
	bool?: GenericCallback;
	keyed?: GenericCallback;
	value?: GenericCallback;
};

export type ArrayInsertType = 'insert' | 'push' | 'splice';

export type ArrayOverlapItem = {
	array: unknown[];
	index: number;
};

export type ArrayOverlapResult = {
	first: ArrayOverlapItem;
	second: ArrayOverlapItem;
	overlap: boolean;
};

// #endregion

// #region Variables

export const ARRAY_CHUNK_MAX_SIZE = 5_000;

export const ARRAY_INSERT_TYPE_INSERT: ArrayInsertType = 'insert';

export const ARRAY_INSERT_TYPE_PUSH: ArrayInsertType = 'push';

export const ARRAY_INSERT_TYPE_SPLICE: ArrayInsertType = 'splice';

export const ARRAY_SETS_COMPARE_DIFFERENCE: ArrayCompareSetsType = 'difference';

export const ARRAY_SETS_COMPARE_INTERSECTION: ArrayCompareSetsType = 'intersection';

export const ARRAY_SETS_COMPARE_UNION: ArrayCompareSetsType = 'union';

export const ARRAY_SLICE_DROP: ArrayExtractType = 'drop';

export const ARRAY_SLICE_TAKE: ArrayExtractType = 'take';

// #endregion
