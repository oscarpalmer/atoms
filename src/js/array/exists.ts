import {findValue} from '~/internal/array/find';
import type {Key as SimpleKey} from '~/models';

/**
 * Does the value exist in array?
 */
export function exists<Item>(array: Item[], value: Item): boolean;

/**
 * Does the value exist in array?
 */
export function exists<Item>(
	array: Item[],
	matches: (item: Item, index: number, array: Item[]) => boolean,
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
export function exists<
	Item,
	Key extends (item: Item, index: number, array: Item[]) => SimpleKey,
>(array: Item[], key: Key, value: ReturnType<Key>): boolean;

export function exists(array: unknown[], ...parameters: unknown[]): boolean {
	return (findValue('index', array, parameters) as number) > -1;
}
