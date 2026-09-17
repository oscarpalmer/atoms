import {FIND_VALUES_ALL, findValues} from '../internal/array/find';
import type {PlainObject} from '../models';

// #region Types

type MapKeyOrCallback<Item> =
	| ((item: Item, index: number, array: Item[]) => unknown)
	| (Item extends PlainObject ? keyof Item : never);

type Mapped<Item, Map extends MapKeyOrCallback<Item>> = Map extends (
	item: Item,
	index: number,
	array: Item[],
) => unknown
	? ReturnType<Map>
	: Map extends keyof Item
		? Item[Map]
		: never;

type ObjectKeysOf<Item> = {
	[Key in keyof Item]: Item[Key] extends PlainObject ? Key : never;
}[keyof Item];

// #endregion

// #region Functions

/**
 * Get a mapped and filtered array of items
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
export function reverseSelect<
	Item,
	Map extends MapKeyOrCallback<Item>,
	FilterCallback extends (item: Mapped<Item, Map>, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	map: Map,
	filterCallback: FilterCallback,
	filterValue: ReturnType<FilterCallback>,
): Array<Mapped<Item, Map>>;

/**
 * Get a mapped and filtered array of items
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
export function reverseSelect<
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
export function reverseSelect<
	Item,
	MapKey extends ObjectKeysOf<Item>,
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
export function reverseSelect<Item, Map extends MapKeyOrCallback<Item>>(
	array: Item[],
	map: Map,
	filter: (item: Mapped<Item, Map>, index: number, array: Item[]) => boolean,
): Array<Mapped<Item, Map>>;

/**
 * Get a mapped and filtered array of items
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
export function reverseSelect<Item, Map extends MapKeyOrCallback<Item>>(
	array: Item[],
	map: Map,
	value: Mapped<Item, Map>,
): Array<Mapped<Item, Map>>;

export function reverseSelect(array: unknown[], ...parameters: unknown[]): unknown[] {
	const mapper = parameters.shift();

	return findValues(FIND_VALUES_ALL, array, parameters, {
		callback: mapper,
		reverse: true,
	}).matched;
}

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
export function select<
	Item,
	FilterCallback extends (item: Item, index: number, array: Item[]) => unknown,
	Map extends MapKeyOrCallback<Item>,
>(
	array: Item[],
	filterCallback: FilterCallback,
	filterValue: ReturnType<FilterCallback>,
	map: Map,
): Array<Mapped<Item, Map>>;

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
export function select<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	Map extends MapKeyOrCallback<Item>,
>(
	array: Item[],
	filterKey: ItemKey,
	filterValue: Item[ItemKey],
	map: Map,
): Array<Mapped<Item, Map>>;

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
export function select<Item, Map extends MapKeyOrCallback<Item>>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
	map: Map,
): Array<Mapped<Item, Map>>;

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
export function select<Item, Map extends MapKeyOrCallback<Item>>(
	array: Item[],
	item: Item,
	map: Map,
): Array<Mapped<Item, Map>>;

export function select(array: unknown[], ...parameters: unknown[]): unknown[] {
	return selectValues(array, parameters);
}

function selectValues(array: unknown[], parameters: unknown[]): unknown[] {
	const mapper = parameters.pop();

	return findValues(FIND_VALUES_ALL, array, parameters, {
		callback: mapper,
		reverse: false,
	}).matched;
}

// #endregion

// #region Initialization

select.reverse = reverseSelect;

// #endregion
