import type {GenericCallback, PlainObject} from '../../models';

type Aggregation = {
	count: number;
	value: number;
};

type AggregationCallback = (
	current: number,
	value: number,
	isNotANumber: boolean,
) => number;

type AggregationType = 'average' | 'max' | 'min' | 'sum';

export function aggregate(
	type: AggregationType,
	array: unknown[],
	key: unknown,
): Aggregation {
	const {length} = array;

	if (length === 0) {
		return {
			count: 0,
			value: Number.NaN,
		};
	}

	const aggregator = aggregators[type];
	const isCallback = typeof key === 'function';

	let count = 0;
	let isNotANumber = true;
	let aggregated = Number.NaN;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		const value = isCallback
			? (key as GenericCallback)(item, index, array)
			: ((item as PlainObject)[key as never] ?? item);

		if (typeof value === 'number' && !Number.isNaN(value)) {
			aggregated = aggregator(aggregated, value, isNotANumber);

			count += 1;
			isNotANumber = false;
		}
	}

	return {
		count,
		value: aggregated,
	};
}

function sum(current: number, value: number, isNotANumber: boolean): number {
	return isNotANumber ? value : current + value;
}

//

const aggregators: Record<AggregationType, AggregationCallback> = {
	sum,
	average: sum,
	max: (current, value, isNotANumber) =>
		isNotANumber || value > current ? value : current,
	min: (current, value, isNotANumber) =>
		isNotANumber || value < current ? value : current,
};
