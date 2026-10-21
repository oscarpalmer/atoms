import {findValues} from '../internal/array/find';
import {ARRAY_FIND_VALUES_ALL} from '../models/array/array.find.model';
import type {ArrayFlattened} from '../models/array/array.misc.model';
import type {GenericCallback} from '../models/index';

// #region Functions

/**
 * Get a narrowed, mapped, and flattened array of items
 *
 * _Available as `filterAndFlatMap`, `filterAndMap.flat`, and `select.flat`_
 *
 * @param array Array to select from
 * @param filter Type guard to filter and narrow down the items
 * @param mapper Callback to map and flatten the narrowed items
 * @returns Narrowed, mapped, and flattened array of items
 *
 * @example
 * ```typescript
 * filterAndFlatMap(
 *   [{id: 1, tags: ['a', 'b']}, {id: 2}, {id: 3, tags: ['c']}],
 *   (item): item is {id: number; tags: string[]} => item.tags != null,
 *   item => item.tags,
 * ); // => ['a', 'b', 'c']
 * ```
 */
export function filterAndFlatMap<Item, Narrowed extends Item, Mapped>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => item is Narrowed,
	mapper: (item: Narrowed, index: number, array: Item[]) => Mapped,
): Array<ArrayFlattened<Mapped>>;

/**
 * Get a filtered, mapped, and flattened array of items
 *
 * _Available as `filterAndFlatMap`, `filterAndMap.flat`, and `select.flat`_
 *
 * @param array Array to select from
 * @param filter Callback to filter the items
 * @param mapper Callback to map and flatten the filtered items
 * @returns Filtered, mapped, and flattened array of items
 *
 * @example
 * ```typescript
 * filterAndFlatMap(
 *   [{id: 1, tags: ['a', 'b']}, {id: 2, tags: ['c']}, {id: 3, tags: ['d', 'e']}],
 *   item => item.id !== 2,
 *   item => item.tags,
 * ); // => ['a', 'b', 'd', 'e']
 * ```
 */
export function filterAndFlatMap<Item, Mapped>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
	mapper: (item: Item, index: number, array: Item[]) => Mapped,
): Array<ArrayFlattened<Mapped>>;

export function filterAndFlatMap(
	array: unknown[],
	filter: GenericCallback,
	mapper: GenericCallback,
): unknown[] {
	return selectValues(array, filter, mapper, true, false);
}

/**
 * Get a narrowed and mapped array of items
 *
 * _Available as `filterAndMap` and `select`_
 *
 * @param array Array to select from
 * @param filter Type guard to filter and narrow down the items
 * @param mapper Callback to map the narrowed items
 * @returns Narrowed and mapped array of items
 *
 * @example
 * ```typescript
 * filterAndMap(
 *   [{id: 1, name: 'Alice'}, {id: 2}, {id: 3, name: 'Charlie'}],
 *   (item): item is {id: number; name: string} => item.name != null,
 *   item => item.name.toUpperCase(),
 * ); // => ['ALICE', 'CHARLIE']
 * ```
 */
export function filterAndMap<Item, Narrowed extends Item, Mapped>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => item is Narrowed,
	mapper: (item: Narrowed, index: number, array: Item[]) => Mapped,
): Mapped[];

/**
 * Get a filtered and mapped array of items
 *
 * _Available as `filterAndMap` and `select`_
 *
 * @param array Array to select from
 * @param filter Callback to filter the items
 * @param mapper Callback to map the filtered items
 * @returns Filtered and mapped array of items
 *
 * @example
 * ```typescript
 * filterAndMap(
 *   [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}, {id: 3, name: 'Charlie'}],
 *   item => item.id === 2,
 *   item => item.name,
 * ); // => ['Bob']
 * ```
 */
export function filterAndMap<Item, Mapped>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
	mapper: (item: Item, index: number, array: Item[]) => Mapped,
): Mapped[];

export function filterAndMap(
	array: unknown[],
	filter: GenericCallback,
	mapper: GenericCallback,
): unknown[] {
	return selectValues(array, filter, mapper, false, false);
}

/**
 * Get a mapped, flattened, and narrowed array of items
 *
 * _Available as `flatMapAndFilter`, `mapAndFilter.flat`, and `reverseSelect.flat`_
 *
 * @param array Array to select from
 * @param mapper Callback to map and flatten the items
 * @param filter Type guard to filter and narrow down the flattened items
 * @returns Mapped, flattened, and narrowed array of items
 *
 * @example
 * ```typescript
 * flatMapAndFilter(
 *   [{id: 1, values: [1, 'a']}, {id: 2, values: ['b', 2]}],
 *   item => item.values,
 *   (value): value is number => typeof value === 'number',
 * ); // => [1, 2]
 * ```
 */
export function flatMapAndFilter<Item, Mapped, Narrowed extends ArrayFlattened<Mapped>>(
	array: Item[],
	mapper: (item: Item, index: number, array: Item[]) => Mapped,
	filter: (item: ArrayFlattened<Mapped>, index: number, array: Item[]) => item is Narrowed,
): Narrowed[];

/**
 * Get a mapped, flattened, and filtered array of items
 *
 * _Available as `flatMapAndFilter`, `mapAndFilter.flat`, and `reverseSelect.flat`_
 *
 * @param array Array to select from
 * @param mapper Callback to map and flatten the items
 * @param filter Callback to filter the flattened items
 * @returns Mapped, flattened, and filtered array of items
 *
 * @example
 * ```typescript
 * flatMapAndFilter(
 *   [{id: 1, tags: ['a', 'b']}, {id: 2, tags: ['c']}, {id: 3, tags: ['b', 'd']}],
 *   item => item.tags,
 *   tag => tag !== 'b',
 * ); // => ['a', 'c', 'd']
 * ```
 */
export function flatMapAndFilter<Item, Mapped>(
	array: Item[],
	mapper: (item: Item, index: number, array: Item[]) => Mapped,
	filter: (item: ArrayFlattened<Mapped>, index: number, array: Item[]) => boolean,
): Array<ArrayFlattened<Mapped>>;

export function flatMapAndFilter(
	array: unknown[],
	mapper: GenericCallback,
	filter: GenericCallback,
): unknown[] {
	return selectValues(array, filter, mapper, true, true);
}

/**
 * Get a mapped and narrowed array of items
 *
 * _Available as `mapAndFilter`, `reverseSelect`, `filterAndMap.reverse`, and `select.reverse`_
 *
 * @param array Array to select from
 * @param mapper Callback to map the items
 * @param filter Type guard to filter and narrow down the mapped items
 * @returns Mapped and narrowed array of items
 *
 * @example
 * ```typescript
 * mapAndFilter(
 *   [{id: 1, name: 'Alice'}, {id: 2}, {id: 3, name: 'Charlie'}],
 *   item => item.name,
 *   (name): name is string => name != null,
 * ); // => ['Alice', 'Charlie']
 * ```
 */
export function mapAndFilter<Item, Mapped, Narrowed extends Mapped>(
	array: Item[],
	mapper: (item: Item, index: number, array: Item[]) => Mapped,
	filter: (item: Mapped, index: number, array: Item[]) => item is Narrowed,
): Narrowed[];

/**
 * Get a mapped and filtered array of items
 *
 * _Available as `mapAndFilter`, `reverseSelect`, `filterAndMap.reverse`, and `select.reverse`_
 *
 * @param array Array to select from
 * @param mapper Callback to map the items
 * @param filter Callback to filter the mapped items
 * @returns Mapped and filtered array of items
 *
 * @example
 * ```typescript
 * mapAndFilter(
 *   [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}, {id: 3, name: 'Charlie'}],
 *   item => item.name,
 *   name => name.length > 3,
 * ); // => ['Alice', 'Charlie']
 * ```
 */
export function mapAndFilter<Item, Mapped>(
	array: Item[],
	mapper: (item: Item, index: number, array: Item[]) => Mapped,
	filter: (item: Mapped, index: number, array: Item[]) => boolean,
): Mapped[];

export function mapAndFilter(
	array: unknown[],
	mapper: GenericCallback,
	filter: GenericCallback,
): unknown[] {
	return selectValues(array, filter, mapper, false, true);
}

function selectValues(
	array: unknown[],
	filter: GenericCallback,
	mapper: GenericCallback,
	flat: boolean,
	reverse: boolean,
): unknown[] {
	return findValues(ARRAY_FIND_VALUES_ALL, array, [filter], {
		map: {
			flat,
			reverse,
			callback: mapper,
		},
	}).matched;
}

// #endregion

// #region Namespace

export declare namespace filterAndMap {
	export var flat: typeof filterAndFlatMap;
	export var reverse: typeof mapAndFilter;
}

export declare namespace mapAndFilter {
	export var flat: typeof flatMapAndFilter;
}

// #endregion

// #region Initialization

filterAndMap.flat = filterAndFlatMap;
filterAndMap.reverse = mapAndFilter;

mapAndFilter.flat = flatMapAndFilter;

// #endregion

// #region Exports

export {mapAndFilter as reverseSelect, filterAndMap as select};

// #endregion
