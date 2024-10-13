import {findValue} from '~/internal/array/find';
import type {BooleanCallback, KeyCallback} from './models';

/**
 * Does the value exist in array?
 */
export function exists<Item>(array: Item[], value: Item): boolean;

/**
 * Does the value exist in array?
 */
export function exists<Item>(
	array: Item[],
	matches: BooleanCallback<Item>,
): boolean;

/**
 * - Does the value exist in array?
 * - Use `key` to find a comparison value to match with `value`
 */
export function exists<Item, Key extends keyof Item>(
	array: Item[],
	key: Key,
	value: Item[Key],
): boolean;

/**
 * - Does the value exist in array?
 * - Use `key` to find a comparison value to match with `value`
 */
export function exists<Item, Key extends KeyCallback<Item>>(
	array: Item[],
	key: Key,
	value: ReturnType<Key>,
): boolean;

export function exists(array: unknown[], ...parameters: unknown[]): boolean {
	const {length} = parameters;

	return (
		(findValue(
			'index',
			array,
			length === 1 && typeof parameters[0] === 'function'
				? parameters[0]
				: undefined,
			length === 2 ? parameters[0] : undefined,
			length === 1 && typeof parameters[0] !== 'function'
				? parameters[0]
				: parameters[1],
		) as number) > -1
	);
}
