import {findValues} from '~/internal/array/find';
import type {BooleanCallback, KeyCallback} from '~/array/models';

/**
 * Get the number of items _(count)_ that match the given value
 */
export function count<Item>(array: Item[], value: Item): number;

/**
 * Get the number of items _(count)_ that match the given value
 */
export function count<Item>(
	array: Item[],
	matches: BooleanCallback<Item>,
): number;

/**
 * Get the number of items _(count)_ that match the given value
 */
export function count<Item, Key extends keyof Item>(
	array: Item[],
	key: Key,
	value: Item[Key],
): number;

/**
 * Get the number of items _(count)_ that match the given value
 */
export function count<Item, Key extends KeyCallback<Item>>(
	array: Item[],
	key: Key,
	value: ReturnType<Key>,
): number;

export function count(array: unknown[], ...parameters: unknown[]): number {
	const {length} = parameters;

	return findValues(
		'all',
		array,
		length === 1 && typeof parameters[0] === 'function'
			? parameters[0]
			: undefined,
		length === 2 ? parameters[0] : undefined,
		length === 1 && typeof parameters[0] !== 'function'
			? parameters[0]
			: parameters[1],
	).length;
}
