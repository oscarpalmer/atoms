import {compare} from '../internal/value/compare';
import {isPlainObject} from '../is';
import type {PlainObject} from '../models';
import type {CallbackSorter, KeySorter} from './models';

type Sorter = {
	callback?: (item: unknown) => unknown;
	compare?: (
		first: unknown,
		firstValue: unknown,
		second: unknown,
		secondValue: unknown,
	) => number;
	identifier: string;
	key?: string;
	modifier: number;
	sorter?: (
		first: unknown,
		firstValue: unknown,
		second: unknown,
		secondValue: unknown,
	) => number;
};

function getSorter(value: unknown, modifier: number): Sorter | undefined {
	const isObject = isPlainObject(value);

	const sorter: Sorter = {
		identifier: '',
		modifier,
	};

	sorter.compare =
		isObject && typeof value.compare === 'function'
			? (value.compare as never)
			: undefined;

	sorter.key =
		isObject && typeof value.key === 'string'
			? value.key
			: typeof value === 'string'
			? value
			: undefined;

	sorter.callback =
		sorter.key == null
			? isObject && typeof value.value === 'function'
				? (value.value as never)
				: typeof value === 'function'
				? (value as never)
				: undefined
			: undefined;

	if (isObject && typeof value.direction === 'string') {
		sorter.modifier =
			value.direction === 'ascending'
				? 1
				: value.direction === 'descending'
				? -1
				: modifier;
	}

	if (sorter.key != null || sorter.callback != null) {
		sorter.identifier = `${sorter.key ?? sorter.callback}`;

		return sorter;
	}
}

/**
 * Sort an array of items _(defaults to ascending)_
 */
export function sort<Item>(array: Item[], descending?: boolean): Item[];

/**
 * - Sort an array of items, using a sorter to sort by a specific value
 * - Defaults to ascending, but can be changed by setting `descending` to `true`
 */
export function sort<Item extends PlainObject>(
	array: Item[],
	sorter: (item: Item) => unknown,
	descending?: boolean,
): Item[];

/**
 * - Sort an array of items, using a sorter to sort by a specific value
 * - Defaults to ascending, but can be changed by setting `descending` to `true`
 */
export function sort<Item extends PlainObject>(
	array: Item[],
	sorter:
		| keyof Item
		| ((item: Item) => unknown)
		| CallbackSorter<Item>
		| KeySorter<Item>,
	descending?: boolean,
): Item[];

/**
 * - Sort an array of items, using multiple sorters to sort by specific values
 * - Defaults to ascending, but can be changed by setting `descending` to `true`
 */
export function sort<Item>(
	array: Item[],
	sorters: ((item: Item) => unknown)[],
	descending?: boolean,
): Item[];

/**
 * - Sort an array of items, using multiple sorters to sort by specific values
 * - Defaults to ascending, but can be changed by setting `descending` to `true`, either for all sorter or in a specific `Sorter`
 */
export function sort<Item extends PlainObject>(
	array: Item[],
	sorters: Array<
		| keyof Item
		| ((item: Item) => unknown)
		| CallbackSorter<Item>
		| KeySorter<Item>
	>,
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
	const modifier = direction === 'asc' ? 1 : -1;

	const sorters = (Array.isArray(first) ? first : [first])
		.map(item => getSorter(item, modifier))
		.filter(sorter => sorter != null)
		.filter(
			(current, index, sorters) =>
				sorters.findIndex(next => next.identifier === current.identifier) ===
				index,
		);

	const {length} = sorters;

	if (length === 0) {
		return array.sort(
			(first, second) => compare(first as never, second as never) * modifier,
		);
	}

	if (length === 1) {
		const sorter = sorters[0];
		const {callback, key, modifier} = sorter;

		return array.sort((first, second) => {
			const firstValue =
				key == null ? callback?.(first) : (first as PlainObject)[key];

			const secondValue =
				key == null ? callback?.(second) : (second as PlainObject)[key];

			return (
				(sorter.compare?.(first, firstValue, second, secondValue) ??
					compare(firstValue, secondValue)) * modifier
			);
		});
	}

	return array.sort((first, second) => {
		for (let index = 0; index < length; index += 1) {
			const sorter = sorters[index];
			const {callback, key, modifier} = sorter;

			const firstValue =
				key == null ? callback?.(first) : (first as PlainObject)[key];

			const secondValue =
				key == null ? callback?.(second) : (second as PlainObject)[key];

			const compared =
				(sorter.compare?.(first, firstValue, second, secondValue) ??
					compare(firstValue, secondValue)) * modifier;

			if (compared !== 0) {
				return compared;
			}
		}

		return 0;
	});
}
