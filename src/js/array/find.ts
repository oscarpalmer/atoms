import type {BooleanCallback, KeyCallback} from '~/array/models';
import {findValue} from '~/internal/array/find';

/**
 * Get the first item matching `value` _(or `undefined` if no match is found)_
 */
export function find<Item>(array: Item[], value: Item): Item | undefined;

/**
 * Get the first item matching `value` _(or `undefined` if no match is found)_
 */
export function find<Item>(
	array: Item[],
	matches: BooleanCallback<Item>,
): Item | undefined;

/**
 * - Get the first matching item _(or `undefined` if no match is found)_
 * - Use `key` to find a comparison value to match with `value`
 */
export function find<Item, Key extends keyof Item>(
	array: Item[],
	key: Key,
	value: Item[Key],
): Item | undefined;

/**
 * - Get the first matching item _(or `undefined` if no match is found)_
 * - Use `key` to find a comparison value to match with `value`
 */
export function find<Item, Key extends KeyCallback<Item>>(
	array: Item[],
	key: Key,
	value: ReturnType<Key>,
): Item | undefined;

export function find<Item>(
	array: unknown[],
	...parameters: unknown[]
): Item | undefined {
	const {length} = parameters;

	return findValue(
		'value',
		array,
		length === 1 && typeof parameters[0] === 'function'
			? parameters[0]
			: undefined,
		length === 2 ? parameters[0] : undefined,
		length === 1 && typeof parameters[0] !== 'function'
			? parameters[0]
			: parameters[1],
	) as Item | undefined;
}
