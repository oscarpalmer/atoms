import {aggregate, type OnlyNumericalKeys} from './internal/math/aggregate';
import type {PlainObject} from './models';

/**
 * Get the average value from a list of numbers
 */
export function average(values: number[]): number;

/**
 * Get the average value from a list of objects
 */
export function average<Item extends PlainObject>(
	array: Item[],
	key: keyof OnlyNumericalKeys<Item>,
): number;

/**
 * Get the average value from a list of objects
 */
export function average<Item extends PlainObject>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): number;

export function average(array: unknown[], key?: unknown): number {
	if (array.length === 0) {
		return Number.NaN;
	}

	const aggregated = aggregate('average', array, key);

	return aggregated.count > 0
		? aggregated.value / aggregated.count
		: Number.NaN;
}

/**
 * Get the minimum value from a list of numbers
 */
export function min(values: number[]): number;

/**
 * Get the minimum value from a list of objects
 */
export function min<Item extends PlainObject>(
	array: Item[],
	key: keyof OnlyNumericalKeys<Item>,
): number;

/**
 * Get the minimum value from a list of objects
 */
export function min<Item extends PlainObject>(
	array: Item[],
	callback: (item: Item, index: number, array: Item[]) => number,
): number;

export function min(array: unknown[], key?: unknown): number {
	return aggregate('min', array, key).value;
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
	return aggregate('sum', array, key).value;
}

export {max} from './internal/math/aggregate';
