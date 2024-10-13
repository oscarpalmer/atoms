import type {KeyCallback} from '~/array/models';
import {findValues} from '~/internal/array/find';

/**
 * Get an array of unique items
 */
export function unique<Item>(array: Item[]): Item[];

/**
 * - Get an array of unique items
 * - Use `key` to find a comparison value to match with `value`
 */
export function unique<Item, Key extends keyof Item>(
	array: Item[],
	key: Key,
): Item[];

/**
 * - Get an array of unique items
 * - Use `key` to find a comparison value to match with `value`
 */
export function unique<Item, Key extends KeyCallback<Item>>(
	array: Item[],
	key: Key,
): Item[];

export function unique(array: unknown[], key?: unknown): unknown[] {
	return findValues('unique', array, undefined, key, undefined);
}
