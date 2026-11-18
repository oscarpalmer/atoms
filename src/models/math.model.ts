// #region Types

export type MathAggregation = {
	array: boolean;
	count: number;
	first: boolean;
	items?: Record<number, unknown[]>;
	value: number;
};

export type MathAggregationCallback = (
	aggregation: MathAggregation,
	value: number,
	notNumber: boolean,
	item?: unknown,
) => number;

export type MathAggregationType = 'average' | 'max' | 'min' | 'sum';

export type MathNonAverageAggregationType = 'max' | 'min' | 'sum';

// #endregion

// #region Variables

export const MATH_AGGREGATION_AVERAGE = 'average';

export const MATH_AGGREGATION_MAX = 'max';

export const MATH_AGGREGATION_MIN = 'min';

export const MATH_AGGREGATION_SUM = 'sum';

export const MATH_EXPONENT_PREFIX = 'e';

export const MATH_EXPRESSION_ROUNDING: RegExp = /^([+-]?.*)e([+-]?\d+)$/;

/**
 * Largest power of ten that is exactly representable as a double
 */
export const MATH_ROUNDING_DECIMALS_MAX = 22;

/**
 * Relative error margin _(about 2 * `Number.EPSILON`)_ for a scaled value
 */
export const MATH_ROUNDING_TOLERANCE = 4.5e-16;

// #endregion
