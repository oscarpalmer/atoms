import {getCallbacks} from '../internal/array/callbacks';
import type {PlainObject} from '../models';

/**
 * Create a Set from an array of items
 * @param array Array to convert
 * @returns Set of items
 */
export function toSet<Item>(array: Item[]): Set<Item>;

/**
 * Create a Set from an array of items using a key
 * @param array Array to convert
 * @param key Key to use for value
 * @returns Set of values
 */
export function toSet<Item extends PlainObject, Key extends keyof Item>(
	array: Item[],
	key: Key,
): Set<Item[Key]>;

/**
 * Create a Set from an array of items using a callback
 * @param array Array to convert
 * @param callback Callback to get an item's value
 * @returns Set of values
 */
export function toSet<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], callback: Callback): Set<ReturnType<Callback>>;

export function toSet(array: unknown[], value?: unknown): Set<unknown> {
	if (!Array.isArray(array)) {
		return new Set();
	}

	const callbacks = getCallbacks(undefined, undefined, value);

	if (callbacks?.value == null) {
		return new Set(array);
	}

	const {length} = array;
	const set = new Set<unknown>();

	for (let index = 0; index < length; index += 1) {
		set.add(callbacks.value(array[index], index, array));
	}

	return set;
}
