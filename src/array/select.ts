import {findValues} from '../internal/array/find';
import type {PlainObject} from '../models';
import {ARRAY_FIND_VALUES_ALL} from '../models/array/array.find.model';
import type {
	ArrayMapKeyOrCallback,
	ArrayMapped,
	ArrayObjectKeysOf,
} from '../models/array/array.misc.model';

// #region Functions

/**
 * Get a filtered and mapped array of items
 *
 * @param array Array to search in
 * @param filterCallback Callback to get an item's value for matching
 * @param filterValue Value to match against
 * @param map Callback or key to map the matched items
 * @returns Filtered and mapped array of items
 *
 * @example
 * ```typescript
 * select(
 *   [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}, {id: 3, name: 'Charlie'}],
 *   item => item.id,
 *   2,
 *   item => item.name,
 * ); // => ['Bob']
 * ```
 */
export function filterAndMap<
	Item,
	FilterCallback extends (item: Item, index: number, array: Item[]) => unknown,
	Map extends ArrayMapKeyOrCallback<Item>,
>(
	array: Item[],
	filterCallback: FilterCallback,
	filterValue: ReturnType<FilterCallback>,
	map: Map,
): Array<ArrayMapped<Item, Map>>;

/**
 * Get a filtered and mapped array of items
 *
 * @param array Array to search in
 * @param filterKey Key to get an item's value for matching
 * @param filterValue Value to match against
 * @param map Callback or key to map the matched items
 * @returns Filtered and mapped array of items
 *
 * @example
 * ```typescript
 * select(
 *   [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}, {id: 3, name: 'Charlie'}],
 *   'id',
 *   2,
 *   'name',
 * ); // => ['Bob']
 * ```
 */
export function filterAndMap<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	Map extends ArrayMapKeyOrCallback<Item>,
>(
	array: Item[],
	filterKey: ItemKey,
	filterValue: Item[ItemKey],
	map: Map,
): Array<ArrayMapped<Item, Map>>;

/**
 * Get a filtered and mapped array of items
 *
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @param map Callback or key to map the matched items
 * @returns Filtered and mapped array of items
 *
 * @example
 * ```typescript
 * select(
 *   [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}, {id: 3, name: 'Charlie'}],
 *   item => item.id === 2,
 *   item => item.name,
 * ); // => ['Bob']
 * ```
 */
export function filterAndMap<Item, Map extends ArrayMapKeyOrCallback<Item>>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
	map: Map,
): Array<ArrayMapped<Item, Map>>;

/**
 * Get a filtered and mapped array of items
 *
 * @param array Array to search in
 * @param item Item to match against
 * @param map Callback or key to map the matched items
 * @returns Filtered and mapped array of items
 *
 * @example
 * ```typescript
 * select(
 *   [1, 2, 3, 2, 1],
 *   3,
 *   value => value ** 2,
 * ); // => [9]
 * ```
 */
export function filterAndMap<Item, Map extends ArrayMapKeyOrCallback<Item>>(
	array: Item[],
	item: Item,
	map: Map,
): Array<ArrayMapped<Item, Map>>;

export function filterAndMap(array: unknown[], ...parameters: unknown[]): unknown[] {
	return selectValues(array, parameters);
}

/**
 * Get a mapped and filtered array of items
 *
 * _Available as `reverseSelect`_ and `select.reverse`_
 *
 * @param array Array to search in
 * @param map Callback or key to map the items
 * @param filterCallback Callback to get a mapped value's value for matching
 * @param filterValue Value to match against
 * @returns Mapped and filtered array of items
 *
 * @example
 * ```typescript
 * reverseSelect(
 *   [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}, {id: 3, name: 'Charlie'}],
 *   item => item.name,
 *   value => value.length,
 *   3,
 * ); // => ['Bob']
 * ```
 */
export function mapAndFilter<
	Item,
	Map extends ArrayMapKeyOrCallback<Item>,
	FilterCallback extends (item: ArrayMapped<Item, Map>, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	map: Map,
	filterCallback: FilterCallback,
	filterValue: ReturnType<FilterCallback>,
): Array<ArrayMapped<Item, Map>>;

/**
 * Get a mapped and filtered array of items
 *
 * _Available as `reverseSelect`_ and `select.reverse`_
 *
 * @param array Array to search in
 * @param map Callback to map the items
 * @param filterKey Key to get a mapped value's value for matching
 * @param filterValue Value to match against
 * @returns Mapped and filtered array of items
 *
 * @example
 * ```typescript
 * reverseSelect(
 *   [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}, {id: 3, name: 'Charlie'}],
 *   item => ({label: item.name}),
 *   'label',
 *   'Bob',
 * ); // => [{label: 'Bob'}]
 * ```
 */
export function mapAndFilter<
	Item,
	MapCallback extends (item: Item, index: number, array: Item[]) => PlainObject,
	ItemKey extends keyof ReturnType<MapCallback>,
>(
	array: Item[],
	map: MapCallback,
	filterKey: ItemKey,
	filterValue: ReturnType<MapCallback>[ItemKey],
): Array<ReturnType<MapCallback>>;

/**
 * Get a mapped and filtered array of items
 *
 * _Available as `reverseSelect`_ and `select.reverse`_
 *
 * @param array Array to search in
 * @param map Key to map the items
 * @param filterKey Key to get a mapped value's value for matching
 * @param filterValue Value to match against
 * @returns Mapped and filtered array of items
 *
 * @example
 * ```typescript
 * reverseSelect(
 *   [{meta: {tag: 'a'}}, {meta: {tag: 'b'}}],
 *   'meta',
 *   'tag',
 *   'b',
 * ); // => [{tag: 'b'}]
 * ```
 */
export function mapAndFilter<
	Item,
	MapKey extends ArrayObjectKeysOf<Item>,
	ItemKey extends keyof Item[MapKey],
>(
	array: Item[],
	map: MapKey,
	filterKey: ItemKey,
	filterValue: Item[MapKey][ItemKey],
): Array<Item[MapKey]>;

/**
 * Get a mapped and filtered array of items
 *
 * _Available as `reverseSelect`_ and `select.reverse`_
 *
 * @param array Array to search in
 * @param map Callback or key to map the items
 * @param filter Filter callback to match mapped values
 * @returns Mapped and filtered array of items
 *
 * @example
 * ```typescript
 * reverseSelect(
 *   [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}, {id: 3, name: 'Charlie'}],
 *   item => item.name,
 *   value => value.startsWith('B'),
 * ); // => ['Bob']
 * ```
 */
export function mapAndFilter<Item, Map extends ArrayMapKeyOrCallback<Item>>(
	array: Item[],
	map: Map,
	filter: (item: ArrayMapped<Item, Map>, index: number, array: Item[]) => boolean,
): Array<ArrayMapped<Item, Map>>;

/**
 * Get a mapped and filtered array of items
 *
 * _Available as `reverseSelect`_ and `select.reverse`_
 *
 * @param array Array to search in
 * @param map Callback or key to map the items
 * @param value Mapped value to match against
 * @returns Mapped and filtered array of items
 *
 * @example
 * ```typescript
 * reverseSelect(
 *   [1, 2, 3, 2, 1],
 *   value => value ** 2,
 *   4,
 * ); // => [4, 4]
 * ```
 */
export function mapAndFilter<Item, Map extends ArrayMapKeyOrCallback<Item>>(
	array: Item[],
	map: Map,
	value: ArrayMapped<Item, Map>,
): Array<ArrayMapped<Item, Map>>;

export function mapAndFilter(array: unknown[], ...parameters: unknown[]): unknown[] {
	const mapper = parameters.shift();

	return findValues(ARRAY_FIND_VALUES_ALL, array, parameters, {
		callback: mapper,
		reverse: true,
	}).matched;
}

function selectValues(array: unknown[], parameters: unknown[]): unknown[] {
	const mapper = parameters.pop();

	return findValues(ARRAY_FIND_VALUES_ALL, array, parameters, {
		callback: mapper,
		reverse: false,
	}).matched;
}

// #endregion

// #region Namespace

export declare namespace filterAndMap {
	export var reverse: typeof mapAndFilter;
}

// #endregion

// #region Initialization

filterAndMap.reverse = mapAndFilter;

// #endregion

// #region Exports

export {mapAndFilter as reverseSelect, filterAndMap as select};

// #endregion
