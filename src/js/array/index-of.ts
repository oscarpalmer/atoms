import type {BooleanCallback, KeyCallback} from '~/array/models';
import {findValue} from '~/internal/array/find';

/**
 * Get the index for the first item matching `value` _(or `-1` if no match is found)_
 */
export function indexOf<Item>(array: Item[], value: Item): number;

/**
 * Get the index for the first item matching `value` _(or `-1` if no match is found)_
 */
export function indexOf<Item>(
	array: Item[],
	matches: BooleanCallback<Item>,
): number;

/**
 * - Get the index for the first matching item _(or `-1` if no match is found)_
 * - Use `key` to find a comparison value to match with `value`
 */
export function indexOf<Item, Key extends keyof Item>(
	array: Item[],
	key: Key,
	value: Item[Key],
): number;

/**
 * - Get the index for the first matching item _(or `-1` if no match is found)_
 * - Use `key` to find a comparison value to match with `value`
 */
export function indexOf<Item, Key extends KeyCallback<Item>>(
	array: Item[],
	key: Key,
	value: ReturnType<Key>,
): number;

export function indexOf(array: unknown[], ...parameters: unknown[]): number {
	const {length} = parameters;

	return findValue(
		'index',
		array,
		length === 1 && typeof parameters[0] === 'function'
			? parameters[0]
			: undefined,
		length === 2 ? parameters[0] : undefined,
		length === 1 && typeof parameters[0] !== 'function'
			? parameters[0]
			: parameters[1],
	) as number;
}
