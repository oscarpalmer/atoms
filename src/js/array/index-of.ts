import {findValue} from '~/internal/array/find';
import type {Key, PlainObject} from '~/models';

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
export function indexOf<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): number;

/**
 * - Get the index for the first matching item _(or `-1` if no match is found)_
 * - Use `key` to find a comparison value to match with `value`
 */
export function indexOf<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], key: ItemKey, value: ReturnType<ItemKey>): number;

export function indexOf(array: unknown[], ...parameters: unknown[]): number {
	return findValue('index', array, parameters) as number;
}
