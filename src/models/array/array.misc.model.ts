import type {GenericCallback, PlainObject} from '../index';

// #region Types

export type ArrayCompareSetsType = 'difference' | 'intersection' | 'union';

/**
 * Comparison of an array within another array
 */
export type ArrayComparison = 'end' | 'inside' | 'invalid' | 'outside' | 'same' | 'start';

export type ArrayExtractType = 'drop' | 'take';

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

export type ArrayMapKeyOrCallback<Item> =
	| ((item: Item, index: number, array: Item[]) => unknown)
	| (Item extends PlainObject ? keyof Item : never);

export type ArrayMapped<Item, Map extends ArrayMapKeyOrCallback<Item>> = Map extends (
	item: Item,
	index: number,
	array: Item[],
) => unknown
	? ReturnType<Map>
	: Map extends keyof Item
		? Item[Map]
		: never;

export type ArrayObjectKeysOf<Item> = {
	[Key in keyof Item]: Item[Key] extends PlainObject ? Key : never;
}[keyof Item];

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
