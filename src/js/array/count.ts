import {findValues} from '~/internal/array/find';
import type {Key, PlainObject} from '~/models';

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
export function count<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): number;

/**
 * Get the number of items _(count)_ that match the given value
 */
export function count<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], key: ItemKey, value: ReturnType<ItemKey>): number;

export function count(array: unknown[], ...parameters: unknown[]): number {
	return findValues('all', array, parameters).length;
}
