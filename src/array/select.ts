import {FIND_VALUES_ALL, findValues} from '../internal/array/find';
import type {PlainObject} from '../models';

// #region Functions

/**
 * Get a filtered and mapped array of items
 * @param array Array to search in
 * @param filterCallback Callback to get an item's value for matching
 * @param filterValue Value to match against
 * @param mapCallback Callback to map the matched items
 * @returns Filtered and mapped array of items
 */
export function select<
	Item,
	FilterCallback extends (item: Item, index: number, array: Item[]) => unknown,
	MapCallback extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	filterCallback: FilterCallback,
	filterValue: ReturnType<FilterCallback>,
	mapCallback: MapCallback,
): Array<ReturnType<MapCallback>>;

/**
 * Get a filtered and mapped array of items
 * @param array Array to search in
 * @param filterCallback Callback to get an item's value for matching
 * @param filterValue Value to match against
 * @param mapKey Key to get an item's value for mapping
 * @returns Filtered and mapped array of items
 */
export function select<
	Item extends PlainObject,
	FilterCallback extends (item: Item, index: number, array: Item[]) => unknown,
	MapKey extends keyof Item,
>(
	array: Item[],
	filterCallback: FilterCallback,
	filterValue: ReturnType<FilterCallback>,
	mapKey: MapKey,
): Array<Item[MapKey]>;

/**
 * Get a filtered and mapped array of items
 * @param array Array to search in
 * @param filterKey Key to get an item's value for matching
 * @param filterValue Value to match against
 * @param mapCallback Callback to map the matched items
 * @returns Filtered and mapped array of items
 */
export function select<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	MapCallback extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	filterKey: ItemKey,
	filterValue: Item[ItemKey],
	mapCallback: MapCallback,
): Array<ReturnType<MapCallback>>;

/**
 * Get a filtered and mapped array of items
 * @param array Array to search in
 * @param filterKey Key to get an item's value for matching
 * @param filterValue Value to match against
 * @param mapKey Key to get an item's value for mapping
 * @returns Filtered and mapped array of items
 */
export function select<
	Item extends PlainObject,
	ItemKey extends keyof Item,
	MapKey extends keyof Item,
>(
	array: Item[],
	filterKey: ItemKey,
	filterValue: Item[ItemKey],
	mapKey: MapKey,
): Array<Item[MapKey]>;

/**
 * Get a filtered and mapped array of items
 * @param array Array to search in
 * @param filterCallback Filter callback to match items
 * @param mapCallback Callback to map the matched items
 * @returns Filtered and mapped array of items
 */
export function select<
	Item,
	FilterCallback extends (item: Item, index: number, array: Item[]) => unknown,
	MapCallback extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	filterCallback: FilterCallback,
	filterValue: ReturnType<FilterCallback>,
	mapCallback: MapCallback,
): Array<ReturnType<MapCallback>>;

/**
 * Get a filtered and mapped array of items
 * @param array Array to search in
 * @param filterCallback Filter callback to match items
 * @param mapKey Key to get an item's value for mapping
 * @returns Filtered and mapped array of items
 */
export function select<
	Item extends PlainObject,
	FilterCallback extends (item: Item, index: number, array: Item[]) => unknown,
	MapKey extends keyof Item,
>(
	array: Item[],
	filterCallback: FilterCallback,
	filterValue: ReturnType<FilterCallback>,
	mapKey: MapKey,
): Array<Item[MapKey]>;

/**
 * Get a filtered and mapped array of items
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @param map Callback to map the matched items
 * @returns Filtered and mapped array of items
 */
export function select<
	Item,
	MapCallback extends (item: Item, index: number, array: Item[]) => unknown,
>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
	map: MapCallback,
): Array<ReturnType<MapCallback>>;

/**
 * Get a filtered and mapped array of items
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @param map Key to get an item's value for mapping
 * @returns Filtered and mapped array of items
 */
export function select<Item extends PlainObject, MapKey extends keyof Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
	map: MapKey,
): Array<Item[MapKey]>;

/**
 * Get a filtered and mapped array of items
 * @param array Array to search in
 * @param item Item to match against
 * @param map Callback to map the matched items
 * @returns Filtered and mapped array of items
 */
export function select<
	Item,
	MapCallback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], item: Item, map: MapCallback): Array<ReturnType<MapCallback>>;

/**
 * Get a filtered and mapped array of items
 * @param array Array to search in
 * @param item Item to match against
 * @param map Key to get an item's value for mapping
 * @returns Filtered and mapped array of items
 */
export function select<Item extends PlainObject, MapKey extends keyof Item>(
	array: Item[],
	item: Item,
	map: MapKey,
): Array<Item[MapKey]>;

export function select(array: unknown[], ...parameters: unknown[]): unknown[] {
	const mapper = parameters.pop();

	return findValues(FIND_VALUES_ALL, array, parameters, mapper).matched;
}

// #endregion
