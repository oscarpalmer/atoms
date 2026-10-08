import type {NumericalValues, PlainObject} from '../../models/index';
import {
	AGGREGATION_MAX,
	AGGREGATION_MIN,
	type Aggregation,
	type AggregationCallback,
	type AggregationType,
	type NonAverageAggregationType,
} from '../../models/math.model';
import {isNonNumber} from '../is';

// #region Functions

export function aggregate(
	type: AggregationType,
	array: unknown[],
	key: unknown,
	first?: unknown,
): Aggregation {
	const length = Array.isArray(array) ? array.length : 0;

	const aggregation: Aggregation = {
		array: false,
		count: 0,
		first: first === true,
		value: Number.NaN,
	};

	if (length === 0) {
		return aggregation;
	}

	const aggregator = aggregators[type];
	const callback = getAggregateCallback(key);

	aggregation.array = callback != null && (type === AGGREGATION_MAX || type === AGGREGATION_MIN);

	let notNumber = true;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		const value = callback == null ? item : callback(item, index, array);

		if (isNonNumber(value)) {
			continue;
		}

		aggregation.value = aggregator(aggregation, value, notNumber, item);

		aggregation.count += 1;
		notNumber = false;
	}

	return aggregation;
}

function calculateSum(aggregation: Aggregation, value: number, notNumber: boolean): number {
	return notNumber ? value : aggregation.value + value;
}

function getAbsoluteValue(
	condition: (aggregation: Aggregation, value: number) => boolean,
	aggregation: Aggregation,
	value: number,
	notNumber: boolean,
	item?: unknown,
): number {
	if (notNumber || condition(aggregation, value)) {
		if (aggregation.array) {
			aggregation.items ??= {};
			aggregation.items[value] ??= [];

			aggregation.items[value].push(item);
		}

		return value;
	}

	return aggregation.value;
}

export function getAggregateCallback(key: unknown): Function | undefined {
	if (key == null) {
		return;
	}

	return typeof key === 'function' ? key : (item: PlainObject): unknown => item[key as never];
}

export function getAggregated(
	type: NonAverageAggregationType,
	array: unknown[],
	key?: unknown,
	first?: unknown,
): unknown {
	const aggregation = aggregate(type, array, key, first);

	if (aggregation.count === 0) {
		return aggregation.array ? (aggregation.first ? undefined : []) : Number.NaN;
	}

	if (aggregation.array) {
		const array = aggregation.items![aggregation.value];

		return aggregation.first ? array[0] : array;
	}

	return aggregation.value;
}

function isMaxValue(aggregation: Aggregation, value: number): boolean {
	return aggregation.array ? value >= aggregation.value : value > aggregation.value;
}

function isMinValue(aggregation: Aggregation, value: number): boolean {
	return aggregation.array ? value <= aggregation.value : value < aggregation.value;
}

/**
 * Get the maximum value from a list of items
 *
 * @example
 * ```typescript
 * max(
 *   [{id: 1, value: 10}, {id: 2, value: 20}],
 *   item => item.value,
 * ); // => [{id: 2, value: 20}]
 *
 * max([], item => item.value); // => []
 * ```
 *
 * @param items List of items
 * @param callback Callback to get an item's value
 * @param first Return only the first item with the maximum value
 * @returns Item with the maximum value, or `undefined` if no maximum can be found
 */
export function max<Item>(
	items: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
	first: true,
): Item | undefined;

/**
 * Get the maximum value from a list of items
 *
 * @example
 * ```typescript
 * max(
 *   [{id: 1, value: 10}, {id: 2, value: 20}],
 *   'value',
 * ); // => [{id: 2, value: 20}]
 *
 * max([], 'value'); // => []
 * ```
 *
 * @param items List of items
 * @param key Key to use for value
 * @param first Return only the first item with the maximum value
 * @returns Item with the maximum value, or `undefined` if no maximum can be found
 */
export function max<Item extends PlainObject>(
	items: Item[],
	key: keyof NumericalValues<Item>,
	first: true,
): Item | undefined;

/**
 * Get the maximum value from a list of items
 *
 * @example
 * ```typescript
 * max(
 *   [{id: 1, value: 10}, {id: 2, value: 20}],
 *   item => item.value,
 * ); // => [{id: 2, value: 20}]
 *
 * max([], item => item.value); // => []
 * ```
 *
 * @param items List of items
 * @param callback Callback to get an item's value
 * @returns Items with the maximum value
 */
export function max<Item>(
	items: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): Item[];

/**
 * Get the maximum value from a list of items
 *
 * @example
 * ```typescript
 * max(
 *   [{id: 1, value: 10}, {id: 2, value: 20}],
 *   'value',
 * ); // => [{id: 2, value: 20}]
 *
 * max([], 'value'); // => []
 * ```
 *
 * @param items List of items
 * @param key Key to use for value
 * @returns Items with the maximum value
 */
export function max<Item extends PlainObject>(
	items: Item[],
	key: keyof NumericalValues<Item>,
): Item[];

/**
 * Get the maximum value from a list of numbers
 *
 * @example
 * ```typescript
 * max([10, 20]); // => 20
 * max([]);       // => Number.NaN
 * ```
 *
 * @param values List of numbers
 * @returns Maximum value, or `Number.NaN` if no maximum can be found
 */
export function max(values: number[]): number;

export function max(array: unknown[], key?: unknown, first?: unknown): unknown {
	return getAggregated(AGGREGATION_MAX, array, key, first);
}

/**
 * Get the minimum value from a list of items
 *
 * @param items List of items
 * @param callback Callback to get an item's value
 * @param first Return only the first item with the minimum value
 * @returns First item with the minimum value, or `undefined` if no minimum can be found
 */
export function min<Item>(
	items: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
	first: true,
): Item | undefined;

/**
 * Get the minimum value from a list of items
 *
 * @param items List of items
 * @param key Key to use for value
 * @param first Return only the first item with the minimum value
 * @returns First item with the minimum value, or `undefined` if no minimum can be found
 */
export function min<Item extends PlainObject>(
	items: Item[],
	key: keyof NumericalValues<Item>,
	first: true,
): Item | undefined;

/**
 * Get the minimum value from a list of items
 *
 * @param items List of items
 * @param callback Callback to get an item's value
 * @returns Items with the minimum value
 */
export function min<Item>(
	items: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): Item[];

/**
 * Get the minimum value from a list of items
 *
 * @param items List of items
 * @param key Key to use for value
 * @returns Items with the minimum value
 */
export function min<Item extends PlainObject>(
	items: Item[],
	key: keyof NumericalValues<Item>,
): Item[];

/**
 * Get the minimum value from a list of numbers
 *
 * @param values List of numbers
 * @returns Minimum value, or `Number.NaN` if no minimum can be found
 */
export function min(values: number[]): number;

export function min(array: unknown[], key?: unknown, first?: unknown): unknown {
	return getAggregated(AGGREGATION_MIN, array, key, first);
}

// #endregion

// #region Variables

const aggregators: Record<AggregationType, AggregationCallback> = {
	average: calculateSum,
	max: getAbsoluteValue.bind(undefined, isMaxValue),
	min: getAbsoluteValue.bind(undefined, isMinValue),
	sum: calculateSum,
};

// #endregion
