import type {GenericCallback} from '../index';

// #region Types

export type ArrayFindLimitOptions = {
	limit?: number;
	map?: never;
};

export type ArrayFindMapOptions = {
	limit?: never;
	map?: ArrayFindMapper;
};

export type ArrayFindMapper = {
	callback: unknown;
	flat: boolean;
	reverse: boolean;
};

export type ArrayFindOptions = ArrayFindMapOptions | ArrayFindLimitOptions;

export type ArrayFindParameters = {
	array: unknown[];
	arrayLength: number;
	callback?: GenericCallback;
	flat: boolean;
	limit: number;
	map?: ArrayFindParametersMap;
	result: ArrayFindValuesResult;
	type: ArrayFindValuesType;
	value: unknown;
};

export type ArrayFindParametersMap = {
	after?: GenericCallback;
	before?: GenericCallback;
};

export type ArrayFindValueType = 'index' | 'item';

export type ArrayFindValuesResult = {
	matched: unknown[];
	notMatched: unknown[];
};

export type ArrayFindValuesType = 'all' | 'unique';

export type ArrayParameters = {
	bool?: unknown;
	key?: unknown;
	value?: unknown;
};

// #endregion

// #region Variables

export const ARRAY_FIND_VALUE_INDEX = 'index';

export const ARRAY_FIND_VALUE_ITEM = 'item';

export const ARRAY_FIND_VALUES_ALL: ArrayFindValuesType = 'all';

export const ARRAY_FIND_VALUES_UNIQUE: ArrayFindValuesType = 'unique';

export const ARRAY_FIND_UNIQUE_THRESHOLD = 100;

// #endregion
