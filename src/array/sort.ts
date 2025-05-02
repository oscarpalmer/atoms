import {isKey} from '../internal/is';
import {compare} from '../internal/value/compare';
import type {Key, PlainObject} from '../models';
import type {Sorter} from './models';

type SortKeyWithCallback<Item> = {
	callback: (item: Item) => unknown;
	direction: 'asc' | 'desc';
};

/**
 * Sort an array of items _(defaults to ascending)_
 */
export function sort<Item>(array: Item[], descending?: boolean): Item[];

/**
 * - Sort an array of items, using a sorter to sort by a specific value
 * - Defaults to ascending, but can be changed by setting `descending` to `true`, or using a `SortKey`
 */
export function sort<Item>(
	array: Item[],
	sorter: Key | Sorter<Item> | ((item: Item) => unknown),
	descending?: boolean,
): Item[];

/**
 * - Sort an array of items, using a `key` to sort by a specific value
 * - Defaults to ascending, but can be changed by setting `descending` to `true`, or using a `SortKey`
 */
export function sort<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	sorter: ItemKey | Key | Sorter<Item> | ((item: Item) => unknown),
	descending?: boolean,
): Item[];

/**
 * - Sort an array of items, using multiple sorters to sort by specific values
 * - Defaults to ascending, but can be changed by setting `descending` to `true`, or using `SortKey`
 */
export function sort<Item>(
	array: Item[],
	sorters: Array<Key | Sorter<Item> | ((item: Item) => unknown)>,
	descending?: boolean,
): Item[];

/**
 * - Sort an array of items, using multiple sorters to sort by specific values
 * - Defaults to ascending, but can be changed by setting `descending` to `true`, or using `SortKey`
 */
export function sort<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	sorters: Array<ItemKey | Key | Sorter<Item> | ((item: Item) => unknown)>,
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

	const unknownSorters = Array.isArray(first) ? first : [first];
	let {length} = unknownSorters;

	const sorters: SortKeyWithCallback<unknown>[] = [];

	for (let index = 0; index < length; index += 1) {
		const unknownSorter = unknownSorters[index];

		const sorter: SortKeyWithCallback<unknown> = {
			direction,
			callback: undefined as never,
		};

		if (isKey(unknownSorter)) {
			sorter.callback = value => (value as PlainObject)[unknownSorter] as never;
		} else if (typeof unknownSorter === 'function') {
			sorter.callback = unknownSorter;
		} else if (
			typeof unknownSorter?.value === 'function' ||
			isKey(unknownSorter?.value)
		) {
			sorter.direction = unknownSorter?.direction ?? direction;

			sorter.callback =
				typeof unknownSorter.value === 'function'
					? unknownSorter.value
					: value =>
							(value as PlainObject)[unknownSorter.value as Key] as never;
		}

		if (typeof sorter.callback === 'function') {
			const existing = sorters.findIndex(
				existing => existing.callback.toString() === sorter.callback.toString(),
			);

			if (existing > -1) {
				sorters.splice(existing, 1);
			}

			sorters.push(sorter);
		}
	}

	length = sorters.length;

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
				compare(sorters[0].callback(first), sorters[0].callback(second)) *
				(sorters[0].direction === 'asc' ? 1 : -1),
		);
	}

	const sorted = array.sort((first, second) => {
		for (let index = 0; index < length; index += 1) {
			const {callback, direction} = sorters[index];

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
