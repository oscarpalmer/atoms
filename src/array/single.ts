import {FIND_VALUES_ALL, findValues} from '../internal/array/find';
import type {PlainObject} from '../models';

// #region Functions

/**
 * Get the _only_ item matching the given value
 *
 * Throws an error if multiple items match the value
 * @param array Array to search in
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns Only item that matches the value, or `undefined` if no match is found
 */
export function single<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], callback: Callback, value: ReturnType<Callback>): Item | undefined;

/**
 * Get the _only_ item matching the given value by key
 *
 * Throws an error if multiple items match the value
 * @param array Array to search in
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns Only item that matches the value, or `undefined` if no match is found
 */
export function single<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): Item | undefined;

/**
 * Get the _only_ item matching the filter
 *
 * Throws an error if multiple items match the filter
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @returns Only item that matches the filter, or `undefined` if no match is found
 */
export function single<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): Item | undefined;

export function single(array: unknown[], ...parameters: unknown[]): unknown {
	const {matched} = findValues(FIND_VALUES_ALL, array, parameters);

	if (matched.length > 1) {
		throw new Error(SINGLE_MESSAGE);
	}

	return matched[0];
}

// #endregion

// #region Variables

const SINGLE_MESSAGE = 'Multiple items were found';

// #endregion
