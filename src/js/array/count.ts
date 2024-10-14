import {findValues} from '~/internal/array/find';
import type {Key as SimpleKey} from '~/models';

/**
 * Get the number of items _(count)_ that match the given value
 */
export function count<Item>(array: Item[], value: Item): number;

/**
 * Get the number of items _(count)_ that match the given value
 */
export function count<Item>(
	array: Item[],
	matches: (item: Item, index: number, array: Item[]) => boolean,
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
export function count<
	Item,
	Key extends (item: Item, index: number, array: Item[]) => SimpleKey,
>(array: Item[], key: Key, value: ReturnType<Key>): number;

export function count(array: unknown[], ...parameters: unknown[]): number {
	return findValues('all', array, parameters).length;
}
