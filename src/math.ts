import type {GenericCallback, PlainObject} from './models';

type OnlyNumericalKeys<Item> = {
	[Key in keyof Item as Item[Key] extends number ? Key : never]: Item[Key];
};

/**
 * Get the average value from a list of numbers
 */
export function average(values: number[]): number;

export function average<Item extends PlainObject>(
	array: Item[],
	key: keyof OnlyNumericalKeys<Item>,
): number;

export function average<Item extends PlainObject>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): number;

export function average(array: unknown[], key?: unknown): number {
	return array.length === 0
		? Number.NaN
		: sum(array as never[], key as never) / array.length;
}

/**
 * Get the maximum value from a list of numbers
 */
export function max(values: number[]): number;

export function max<Item extends PlainObject>(
	array: Item[],
	key: keyof OnlyNumericalKeys<Item>,
): number;

export function max<Item extends PlainObject>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): number;

export function max(array: unknown[], key?: unknown): number {
	const isCallback = typeof key === 'function';
	const {length} = array;
	let max: number | undefined;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		const value = isCallback
			? (key as GenericCallback)(item, index, array)
			: ((item as PlainObject)[key as never] ?? item);

		if (max == null || value > max) {
			max = value;
		}
	}

	return max ?? Number.NaN;
}

/**
 * Get the minimum value from a list of numbers
 */
export function min(values: number[]): number;

export function min<Item extends PlainObject>(
	array: Item[],
	key: keyof OnlyNumericalKeys<Item>,
): number;

export function min<Item extends PlainObject>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): number;

export function min(array: unknown[], key?: unknown): number {
	const isCallback = typeof key === 'function';
	const {length} = array;
	let min: number | undefined;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		const value = isCallback
			? (key as GenericCallback)(item, index, array)
			: ((item as PlainObject)[key as never] ?? item);

		if (min == null || value < min) {
			min = value;
		}
	}

	return min ?? Number.NaN;
}

/**
 * Round a number to a specific number of decimal places _(defaults to 0)_
 */
export function round(value: number, decimals?: number): number {
	if (typeof decimals !== 'number' || decimals < 1) {
		return Math.round(value);
	}

	const mod = 10 ** decimals;

	return Math.round((value + Number.EPSILON) * mod) / mod;
}

/**
 * Get the sum of a list of numbers
 */
export function sum(values: number[]): number;

export function sum<Item extends PlainObject>(
	array: Item[],
	key: keyof OnlyNumericalKeys<Item>,
): number;

export function sum<Item extends PlainObject>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): number;

export function sum(array: unknown[], key?: unknown): number {
	const isCallback = typeof key === 'function';
	const {length} = array;
	let sum = 0;

	for (let index = 0; index < length; index += 1) {
		const value = array[index];

		sum += isCallback
			? (key as GenericCallback)(value, index, array)
			: ((value as PlainObject)[key as never] ?? value);
	}

	return sum;
}
