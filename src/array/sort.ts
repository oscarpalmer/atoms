import {isKey} from '../is';
import type {Key, PlainObject} from '../models';
import {compare} from '../value/compare';
import type {SortKey, SortKeyWithCallback} from './models';

/**
 * Sort an array of items _(defaults to ascending)_
 */
export function sort<Item>(array: Item[], descending?: boolean): Item[];

/**
 * - Sort an array of items, using a `key` to sort by a specific value
 * - Defaults to ascending, but can be changed by setting `descending` to `true`, or using a `SortKey`
 */
export function sort<Item>(
	array: Item[],
	key: Key | SortKey<Item> | ((item: Item) => Key),
	descending?: boolean,
): Item[];

/**
 * - Sort an array of items, using a `key` to sort by a specific value
 * - Defaults to ascending, but can be changed by setting `descending` to `true`, or using a `SortKey`
 */
export function sort<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey | Key | SortKey<Item> | ((item: Item) => Key),
	descending?: boolean,
): Item[];

/**
 * - Sort an array of items, using multiple `keys` to sort by specific values
 * - Defaults to ascending, but can be changed by setting `descending` to `true`, or using `SortKey`
 */
export function sort<Item>(
	array: Item[],
	keys: Array<Key | SortKey<Item> | ((item: Item) => Key)>,
	descending?: boolean,
): Item[];

/**
 * - Sort an array of items, using multiple `keys` to sort by specific values
 * - Defaults to ascending, but can be changed by setting `descending` to `true`, or using `SortKey`
 */
export function sort<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	keys: Array<ItemKey | Key | SortKey<Item> | ((item: Item) => Key)>,
	descending?: boolean,
): Item[];

export function sort(
	array: unknown[],
	first?: unknown,
	second?: unknown,
): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	if (array.length < 2) {
		return array;
	}

	const direction = first === true || second === true ? 'desc' : 'asc';

	const unknownKeys = Array.isArray(first) ? first : [first];
	let {length} = unknownKeys;

	const keys: SortKeyWithCallback<unknown>[] = [];

	for (let index = 0; index < length; index += 1) {
		const key = unknownKeys[index];

		const keyWithCallback: SortKeyWithCallback<unknown> = {
			direction,
			callback: undefined as never,
		};

		if (isKey(key)) {
			keyWithCallback.callback = value => (value as PlainObject)[key] as never;
		} else if (typeof key === 'function') {
			keyWithCallback.callback = key;
		} else if (typeof key?.value === 'function' || isKey(key?.value)) {
			keyWithCallback.direction = key?.direction ?? direction;

			keyWithCallback.callback =
				typeof key.value === 'function'
					? key.value
					: value => (value as PlainObject)[key.value as Key] as never;
		}

		if (typeof keyWithCallback.callback === 'function') {
			const existing = keys.findIndex(
				existing =>
					existing.callback.toString() === keyWithCallback.callback.toString(),
			);

			if (existing > -1) {
				keys.splice(existing, 1);
			}

			keys.push(keyWithCallback);
		}
	}

	length = keys.length;

	if (length === 0) {
		return array.sort(
			(first, second) =>
				compare(first as never, second as never) *
				(direction === 'asc' ? 1 : -1),
		);
	}

	if (length === 1) {
		return array.sort(
			(first, second) =>
				compare(keys[0].callback(first), keys[0].callback(second)) *
				(keys[0].direction === 'asc' ? 1 : -1),
		);
	}

	const sorted = array.sort((first, second) => {
		for (let index = 0; index < length; index += 1) {
			const {callback, direction} = keys[index];

			const compared =
				compare(callback(first), callback(second)) *
				(direction === 'asc' ? 1 : -1);

			if (compared !== 0) {
				return compared;
			}
		}

		return 0;
	});

	return sorted;
}
