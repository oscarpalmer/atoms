// #region Types

export type ArrayFindMapper = {
	callback: unknown;
	reverse: boolean;
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
