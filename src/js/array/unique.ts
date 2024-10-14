import {findValues} from '~/internal/array/find';
import type {Key as SimpleKey} from '~/models';

/**
 * Get an array of unique items
 */
export function unique<Item>(array: Item[]): Item[];

/**
 * - Get an array of unique items
 * - Use `key` to find a comparison value for an item
 */
export function unique<Item, Key extends keyof Item>(
	array: Item[],
	key: Key,
): Item[];

/**
 * - Get an array of unique items
 * - Use `key` to find a comparison value for an item
 */
export function unique<
	Item,
	Key extends (item: Item, index: number, array: Item[]) => SimpleKey,
>(array: Item[], key: Key): Item[];

export function unique(array: unknown[], key?: unknown): unknown[] {
	return findValues('unique', array, [key, undefined]);
}
