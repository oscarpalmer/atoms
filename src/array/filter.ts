import {findValues} from '../internal/array/find';
import type {Key, PlainObject} from '../models';

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
export function filter<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): Item[];

/**
 * - Get a filtered array of items
 * - Use `key` to find a comparison value to match with `value`
 */
export function filter<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], key: ItemKey, value: ReturnType<ItemKey>): Item[];

export function filter(array: unknown[], ...parameters: unknown[]): unknown[] {
	return findValues('all', array, parameters);
}
