import {compare} from '../internal/value/compare';
import {isPlainObject} from '../internal/is';
import type {GenericCallback, PlainObject, Primitive} from '../models';
import type {CallbackSorter, KeySorter} from './models';

// #region Types

type Sorter = {
	callback?: (item: unknown) => unknown;
	compare?: (first: unknown, firstValue: unknown, second: unknown, secondValue: unknown) => number;
	identifier: string;
	key?: string;
	modifier: number;
	sorter?: (first: unknown, firstValue: unknown, second: unknown, secondValue: unknown) => number;
};

// #endregion

// #region Functions

function getCallback(
	value: unknown,
	key: string | undefined,
	forObject: boolean,
): GenericCallback | undefined {
	if (key != null) {
		return;
	}

	if (forObject && typeof (value as PlainObject).value === 'function') {
		return (value as PlainObject).value as never;
	}

	return typeof value === 'function' ? (value as never) : undefined;
}

function getKey(value: unknown, forObject: boolean): string | undefined {
	if (forObject && typeof (value as PlainObject).key === 'string') {
		return (value as PlainObject).key as string;
	}

	return typeof value === 'string' ? value : undefined;
}

function getModifier(value: unknown, modifier: number, forObject: boolean): number {
	if (!forObject || typeof (value as PlainObject).direction !== 'string') {
		return modifier;
	}

	if ((value as PlainObject).direction === 'ascending') {
		return 1;
	}

	return (value as PlainObject).direction === 'descending' ? -1 : modifier;
}

function getSorter(value: unknown, modifier: number): Sorter | undefined {
	const forObject = isPlainObject(value);

	const sorter: Sorter = {
		identifier: '',
		modifier,
	};

	sorter.compare =
		forObject && typeof value.compare === 'function' ? (value.compare as never) : undefined;

	sorter.key = getKey(value, forObject);
	sorter.modifier = getModifier(value, modifier, forObject);
	sorter.callback = getCallback(value, sorter.key, forObject);

	if (sorter.key != null || sorter.callback != null) {
		sorter.identifier = `${sorter.key ?? sorter.callback}`;

		return sorter;
	}
}

/**
 * Sort an array of items, using multiple sorters to sort by specific values
 * @param array Array to sort
 * @param sorters Sorters to use for sorting
 * @param descending Sort in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Sorted array
 */
export function sort<Item extends PlainObject>(
	array: Item[],
	sorters: Array<keyof Item | ((item: Item) => unknown) | CallbackSorter<Item> | KeySorter<Item>>,
	descending?: boolean,
): Item[];

/**
 * Sort an array of items, using a sorter to sort by a specific value
 * @param array Array to sort
 * @param sorter Sorter to use for sorting
 * @param descending Sort in descending order? _(defaults to `false`; overridden by the sorter)_
 * @returns Sorted array
 */
export function sort<Item extends PlainObject>(
	array: Item[],
	sorter: keyof Item | ((item: Item) => unknown) | CallbackSorter<Item> | KeySorter<Item>,
	descending?: boolean,
): Item[];

/**
 * Sort an array of items, using multiple sorters to sort by specific values
 * @param array Array to sort
 * @param sorters Sorters to use for sorting
 * @param descending Sort in descending order? _(defaults to `false`; overridden by individual sorters)_
 * @returns Sorted array
 */
export function sort<Item extends Primitive>(
	array: Item[],
	sorters: ((item: Item) => unknown)[],
	descending?: boolean,
): Item[];

/**
 * Sort an array of items, using a sorter to sort by a specific value
 * @param array Array to sort
 * @param sorter Sorter to use for sorting
 * @param descending Sort in descending order? _(defaults to `false`; overridden by the sorter)_
 * @returns Sorted array
 */
export function sort<Item extends Primitive>(
	array: Item[],
	sorter: (item: Item) => unknown,
	descending?: boolean,
): Item[];

/**
 * Sort an array of items
 * @param array Array to sort
 * @param descending Sort in descending order? _(defaults to `false`)_
 * @returns Sorted array
 */
export function sort<Item>(array: Item[], descending?: boolean): Item[];

export function sort(array: unknown[], first?: unknown, second?: unknown): unknown[] {
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
			(current, index, filtered) =>
				filtered.findIndex(next => next.identifier === current.identifier) === index,
		);

	const {length} = sorters;

	if (length === 0) {
		return array.sort(
			(firstItem, secondItem) => compare(firstItem as never, secondItem as never) * modifier,
		);
	}

	if (length === 1) {
		const sorter = sorters[0];
		const {callback, key} = sorter;

		return array.sort((firstItem, secondItem) => {
			const firstValue = key == null ? callback?.(firstItem) : (firstItem as PlainObject)[key];
			const secondValue = key == null ? callback?.(secondItem) : (secondItem as PlainObject)[key];

			return (
				(sorter.compare?.(firstItem, firstValue, secondItem, secondValue) ??
					compare(firstValue, secondValue)) * sorter.modifier
			);
		});
	}

	return array.sort((firstItem, secondItem) => {
		for (let index = 0; index < length; index += 1) {
			const sorter = sorters[index];
			const {callback, key} = sorter;

			const firstValue = key == null ? callback?.(firstItem) : (firstItem as PlainObject)[key];
			const secondValue = key == null ? callback?.(secondItem) : (secondItem as PlainObject)[key];

			const compared =
				(sorter.compare?.(firstItem, firstValue, secondItem, secondValue) ??
					compare(firstValue, secondValue)) * sorter.modifier;

			if (compared !== 0) {
				return compared;
			}
		}

		return 0;
	});
}

// #endregion
