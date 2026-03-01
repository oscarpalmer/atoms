import type {NumericalValues, PlainObject} from '../../models';
import {isNumber} from '../is';

// #region Types

type Aggregation = {
	count: number;
	value: number;
};

type AggregationCallback = (current: number, value: number, notNumber: boolean) => number;

export type AggregationType = 'average' | 'max' | 'min' | 'sum';

// #endregion

// #region Functions

export function aggregate(type: AggregationType, array: unknown[], key: unknown): Aggregation {
	const length = Array.isArray(array) ? array.length : 0;

	if (length === 0) {
		return {
			count: 0,
			value: Number.NaN,
		};
	}

	const aggregator = aggregators[type];
	const callback = getAggregateCallback(key);

	let counted = 0;
	let aggregated = Number.NaN;
	let notNumber = true;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		const value = callback == null ? item : callback(item as never, index, array);

		if (!isNumber(value)) {
			continue;
		}

		aggregated = aggregator(aggregated, value, notNumber);

		counted += 1;
		notNumber = false;
	}

	return {
		count: counted,
		value: aggregated,
	};
}

export function getAggregateCallback(key: unknown): Function | undefined {
	if (key == null) {
		return;
	}

	return typeof key === 'function' ? key : (item: PlainObject): unknown => item[key as never];
}

/**
 * Get the maximum value from a list of items
 * @param items List of items
 * @param callback Callback to get an item's value
 * @returns Maximum value, or `NaN` if no maximum can be found
 */
export function max<Item>(
	items: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): number;

/**
 * Get the maximum value from a list of items
 * @param items List of items
 * @param key Key to use for value
 * @returns Maximum value, or `NaN` if no maximum can be found
 */
export function max<Item extends PlainObject>(
	items: Item[],
	key: keyof NumericalValues<Item>,
): number;

/**
 * Get the maximum value from a list of numbers
 * @param values List of numbers
 * @returns Maximum value, or `NaN` if no maximum can be found
 */
export function max(values: number[]): number;

export function max(array: unknown[], key?: unknown): number {
	return getAggregated('max', array, key);
}

function calculateSum(current: number, value: number, notNumber: boolean): number {
	return notNumber ? value : current + value;
}

export function getAggregated(
	type: Exclude<AggregationType, 'average'>,
	array: unknown[],
	key?: unknown,
): number {
	const aggregated = aggregate(type, array, key);

	return aggregated.count > 0 ? aggregated.value : Number.NaN;
}

// #endregion

// #region Variables

const aggregators: Record<AggregationType, AggregationCallback> = {
	average: calculateSum,
	max: (current: number, value: number, notNumber: boolean) =>
		notNumber || value > current ? value : current,
	min: (current: number, value: number, notNumber: boolean) =>
		notNumber || value < current ? value : current,
	sum: calculateSum,
};

// #endregion
