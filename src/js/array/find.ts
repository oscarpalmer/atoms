import {findValue} from '~/internal/array/find';
import type {Key as SimpleKey} from '~/models';

/**
 * Get the first item matching `value` _(or `undefined` if no match is found)_
 */
export function find<Item>(array: Item[], value: Item): Item | undefined;

/**
 * Get the first item matching `value` _(or `undefined` if no match is found)_
 */
export function find<Item>(
	array: Item[],
	matches: (item: Item, index: number, array: Item[]) => boolean,
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
export function find<
	Item,
	Key extends (item: Item, index: number, array: Item[]) => SimpleKey,
>(array: Item[], key: Key, value: ReturnType<Key>): Item | undefined;

export function find<Item>(
	array: unknown[],
	...parameters: unknown[]
): Item | undefined {
	return findValue('value', array, parameters) as Item | undefined;
}
