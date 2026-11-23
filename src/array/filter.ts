import type {GenericCallback, PlainObject} from '../models/misc.model';

// #region Functions

/**
 * Get a filtered array of items that do not match the value
 *
 * _Available as `exclude` and `filter.remove`_
 *
 * @param array Array to search in
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns Filtered array of items that do not match the filter
 *
 * @example
 * ```typescript
 * exclude(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   item => item.id,
 *   2,
 * ); // => [{id: 1}, {id: 3}]
 * ```
 */
export function exclude<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], callback: Callback, value: ReturnType<Callback>): Item[];

/**
 * Get a filtered array of items that do not match the value
 *
 * _Available as `exclude` and `filter.remove`_
 *
 * @param array Array to search in
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns Filtered array of items that do not match the filter
 *
 * @example
 * ```typescript
 * exclude(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   'id',
 *   2,
 * ); // => [{id: 1}, {id: 3}]
 * ```
 */
export function exclude<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): Item[];

/**
 * Get a narrowed array of items that do not match the filter
 *
 * _Available as `exclude` and `filter.remove`_
 *
 * @param array Array to search in
 * @param filter Type guard to exclude and narrow down the items
 * @returns Narrowed array of items that do not match the filter
 *
 * @example
 * ```typescript
 * exclude(
 *   [1, 'a', 2, 'b'],
 *   (item): item is string => typeof item === 'string',
 * ); // => [1, 2]
 * ```
 */
export function exclude<Item, Narrowed extends Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => item is Narrowed,
): Array<Exclude<Item, Narrowed>>;

/**
 * Get a filtered array of items that do not match the filter
 *
 * _Available as `exclude` and `filter.remove`_
 *
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @returns Filtered array of items that do not match the filter
 *
 * @example
 * ```typescript
 * exclude(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   item => item.id === 2,
 * ); // => [{id: 1}, {id: 3}]
 * ```
 */
export function exclude<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): Item[];

/**
 * Get a filtered array of items that do not match the given item
 *
 * _Available as `exclude` and `filter.remove`_
 *
 * @param array Array to search in
 * @param item Item to match against
 * @returns Filtered array of items that do not match the given item
 *
 * @example
 * ```typescript
 * exclude([1, 2, 3], 2); // => [1, 3]
 * ```
 */
export function exclude<Item>(array: Item[], item: Item): Item[];

export function exclude(array: unknown[], ...parameters: unknown[]): unknown[] {
	return filterValues(array, parameters, false);
}

/**
 * Get a filtered array of items
 *
 * @param array Array to search in
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns Filtered array of items
 *
 * @example
 * ```typescript
 * filter(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   item => item.id,
 *   2,
 * ); // => [{id: 2}]
 * ```
 */
export function filter<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], callback: Callback, value: ReturnType<Callback>): Item[];

/**
 * Get a filtered array of items
 *
 * @param array Array to search in
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns Filtered array of items
 *
 * @example
 * ```typescript
 * filter(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   'id',
 *   2,
 * ); // => [{id: 2}]
 * ```
 */
export function filter<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): Item[];

/**
 * Get a narrowed array of items matching the filter
 *
 * @param array Array to search in
 * @param filter Type guard to match and narrow down the items
 * @returns Narrowed array of items
 *
 * @example
 * ```typescript
 * filter(
 *   [{id: 1, tags: ['a', 'b']}, {id: 2}, {id: 3, tags: ['c']}],
 *   (item): item is {id: number; tags: string[]} => item.tags != null,
 * ); // => [{id: 1, tags: ['a', 'b']}, {id: 3, tags: ['c']}]
 * ```
 */
export function filter<Item, Narrowed extends Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => item is Narrowed,
): Narrowed[];

/**
 * Get a filtered array of items matching the filter
 *
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @returns Filtered array of items
 *
 * @example
 * ```typescript
 * filter(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   item => item.id === 2,
 * ); // => [{id: 2}]
 * ```
 */
export function filter<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): Item[];

/**
 * Get a filtered array of items matching the given item
 *
 * @param array Array to search in
 * @param item Item to match against
 * @returns Filtered array of items
 *
 * @example
 * ```typescript
 * filter([1, 2, 3], 2); // => [2]
 * ```
 */
export function filter<Item>(array: Item[], item: Item): Item[];

export function filter(array: unknown[], ...parameters: unknown[]): unknown[] {
	return filterValues(array, parameters, true);
}

function filterValues(array: unknown[], parameters: unknown[], include: boolean): unknown[] {
	if (!Array.isArray(array)) {
		return [];
	}

	if (array.length === 0) {
		return [];
	}

	const [first, second] = parameters;
	const {length} = parameters;

	if (length === 1) {
		return typeof first === 'function'
			? array.filter(
					(item, index, array) => (first as GenericCallback)(item, index, array) === include,
				)
			: array.filter(item => Object.is(item, first) === include);
	}

	let callback: GenericCallback | undefined;

	if (typeof first === 'function') {
		callback = first as GenericCallback;
	} else if (typeof first === 'number' || typeof first === 'string') {
		callback = (item: PlainObject) => item[first];
	}

	if (callback == null) {
		return [];
	}

	return array.filter(
		(item, index, array) => Object.is(callback(item, index, array), second) === include,
	);
}

// #endregion

// #region Namespace

export declare namespace filter {
	export var remove: typeof exclude;
}

// #endregion

// #region Initialization

filter.remove = exclude;

// #endregion
