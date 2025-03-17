import {findValue} from '../internal/array/find';
import type {Key, PlainObject} from '../models';

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
export function exists<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): boolean;

/**
 * - Does the value exist in array?
 * - Use `key` to find a comparison value to match with `value`
 */
export function exists<
	Item,
	ItemKey extends (item: Item, index: number, array: Item[]) => Key,
>(array: Item[], key: ItemKey, value: ReturnType<ItemKey>): boolean;

export function exists(array: unknown[], ...parameters: unknown[]): boolean {
	if (parameters.length === 1 && typeof parameters[0] !== 'function') {
		return Array.isArray(array) ? array.includes(parameters[0]) : false;
	}

	return (findValue('index', array, parameters) as number) > -1;
}
