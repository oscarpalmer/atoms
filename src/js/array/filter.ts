import {findValues} from '~/internal/array/find';
import type {Key as SimpleKey} from '~/models';

/**
 * Get a filtered array of items matching `value`
 */
export function filter<Item>(array: Item[], value: Item): Item[];

/**
 * Get a filtered array of items matching `value`
 */
export function filter<Item>(
	array: Item[],
	matches: (item: Item, index: number, array: Item[]) => boolean,
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
export function filter<
	Item,
	Key extends (item: Item, index: number, array: Item[]) => SimpleKey,
>(array: Item[], key: Key, value: ReturnType<Key>): Item[];

export function filter(array: unknown[], ...parameters: unknown[]): unknown[] {
	return findValues('all', array, parameters);
}
