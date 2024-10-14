import {findValue} from '~/internal/array/find';
import type {Key as SimpleKey} from '~/models';

/**
 * Get the index for the first item matching `value` _(or `-1` if no match is found)_
 */
export function indexOf<Item>(array: Item[], value: Item): number;

/**
 * Get the index for the first item matching `value` _(or `-1` if no match is found)_
 */
export function indexOf<Item>(
	array: Item[],
	matches: (item: Item, index: number, array: Item[]) => boolean,
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
export function indexOf<
	Item,
	Key extends (item: Item, index: number, array: Item[]) => SimpleKey,
>(array: Item[], key: Key, value: ReturnType<Key>): number;

export function indexOf(array: unknown[], ...parameters: unknown[]): number {
	return findValue('index', array, parameters) as number;
}
