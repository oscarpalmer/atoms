// #region Types

/**
 * Options for value comparison
 */
export type DiffOptions = {
	/**
	 * Should `null` and `undefined` be considered equal and ignored in results?
	 */
	relaxedNullish?: boolean;
};

/**
 * The result of a comparison beteen two values
 */
export type DiffResult<First, Second = First> = {
	/**
	 * The original values that were compared
	 */
	original: DiffValue<First, Second>;
	/**
	 * The type of difference between the two values
	 */
	type: DiffType;
	/**
	 * The differences between the two values
	 *
	 * - Keys are in dot notation
	 * - Values are objects with `from` and `to` properties
	 */
	values: Record<string, DiffValue>;
};

export type DiffType = 'full' | 'none' | 'partial';

/**
 * The difference between two values
 */
export type DiffValue<First = unknown, Second = First> = {
	/**
	 * The value from the first value
	 */
	from: First;
	/**
	 * The value from the second value
	 */
	to: Second;
};

export type DiffKeyedValue = {
	key: string;
} & DiffValue;

export type DiffParameters = {
	changes: DiffKeyedValue[];
	key: PropertyKey;
	options: Required<DiffOptions>;
	values: {first: unknown; second: unknown};
	prefix?: string;
};

// #endregion

// #region Variables

export const DIFF_FULL: DiffType = 'full';

export const DIFF_NONE: DiffType = 'none';

export const DIFF_PARTIAL: DiffType = 'partial';

// #endregion
