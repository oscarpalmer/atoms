// #region Types

export type Aggregation = {
	array: boolean;
	count: number;
	first: boolean;
	items?: Record<number, unknown[]>;
	value: number;
};

export type AggregationCallback = (
	aggregation: Aggregation,
	value: number,
	notNumber: boolean,
	item?: unknown,
) => number;

export type AggregationType = 'average' | 'max' | 'min' | 'sum';

export type NonAverageAggregationType = 'max' | 'min' | 'sum';

// #endregion

// #region Variables

export const AGGREGATION_AVERAGE = 'average';

export const AGGREGATION_MAX = 'max';

export const AGGREGATION_MIN = 'min';

export const AGGREGATION_SUM = 'sum';

// #endregion
