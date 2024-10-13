import type {BooleanCallback, KeyCallback} from '~/array/models';
import {findValues} from '~/internal/array/find';

/**
 * Get a filtered array of items matching `value`
 */
export function filter<Item>(array: Item[], value: Item): Item[];

/**
 * Get a filtered array of items matching `value`
 */
export function filter<Item>(
	array: Item[],
	matches: BooleanCallback<Item>,
): Item[];

/**
 * - Get a filtered array of items
 * - Use `key` to find a comparison value to match with `value`
 */
export function filter<Item, Key extends keyof Item>(
	array: Item[],
	key: Key,
	value: Item[Key],
): Item[];

/**
 * - Get a filtered array of items
 * - Use `key` to find a comparison value to match with `value`
 */
export function filter<Item, Key extends KeyCallback<Item>>(
	array: Item[],
	key: Key,
	value: ReturnType<Key>,
): Item[];

export function filter(array: unknown[], ...parameters: unknown[]): unknown[] {
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
	);
}
