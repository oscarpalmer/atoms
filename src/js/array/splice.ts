import {insertValues} from './insert';

/**
 * Removes and returns all items from an array starting from a specific index
 */
export function splice<Value>(array: Value[], start: number): Value[];

/**
 * Removes and returns _(up to)_ a specific amount of items from an array, starting from a specific index
 */
export function splice<Value>(
	array: Value[],
	start: number,
	amount: number,
): Value[];

/**
 * - Splices values into an array and returns any removed values
 * - Uses chunking to avoid stack overflow
 */
export function splice<Value>(
	array: Value[],
	start: number,
	values: Value[],
): Value[];

/**
 * - Splices values into an array and returns any removed values
 * - Uses chunking to avoid stack overflow
 */
export function splice<Value>(
	array: Value[],
	start: number,
	amount: number,
	values: Value[],
): Value[];

export function splice<Value>(
	array: Value[],
	start: number,
	amountOrValues?: number | Value[],
	values?: Value[],
): Value[] {
	const amoutOrValuesIsArray = Array.isArray(amountOrValues);

	return insertValues(
		'splice',
		array,
		amoutOrValuesIsArray ? amountOrValues : values ?? [],
		start,
		amoutOrValuesIsArray
			? array.length
			: typeof amountOrValues === 'number' && amountOrValues > 0
				? amountOrValues
				: 0,
	) as Value[];
}
