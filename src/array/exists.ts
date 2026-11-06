import type {GenericCallback, PlainObject} from '../models/index';

// #region Functions

/**
 * Does an item with a specific value exist in the array?
 *
 * @param array Array to search in
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns `true` if the item exists in the array, otherwise `false`
 *
 * @example
 * ```typescript
 * exists(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   item => item.id,
 *   2,
 * ); // => true
 * ```
 */
export function exists<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], callback: Callback, value: ReturnType<Callback>): boolean;

/**
 * Does an item with a specific value exist in the array?
 *
 * @param array Array to search in
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns `true` if the item exists in the array, otherwise `false`
 *
 * @example
 * ```typescript
 * exists(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   'id',
 *   2,
 * ); // => true
 * ```
 */
export function exists<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): boolean;

/**
 * Does an item in the array match the filter?
 *
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @returns `true` if a matching item exists, otherwise `false`
 *
 * @example
 * ```typescript
 * exists(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   item => item.id === 2,
 * ); // => true
 * ```
 */
export function exists<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): boolean;

/**
 * Does the item exist in the array?
 *
 * @param array Array to search in
 * @param item Item to search for
 * @returns `true` if the item exists in the array, otherwise `false`
 *
 * @example
 * ```typescript
 * exists([1, 2, 3], 2); // => true
 * ```
 */
export function exists<Item>(array: Item[], item: Item): boolean;

export function exists(array: unknown[], ...parameters: unknown[]): boolean {
	if (!Array.isArray(array)) {
		return false;
	}

	if (array.length === 0) {
		return false;
	}

	const [first, second] = parameters;
	const {length} = parameters;

	if (length === 1) {
		return typeof first === 'function'
			? array.some((item, index, array) => (first as GenericCallback)(item, index, array))
			: array.includes(first);
	}

	let callback: GenericCallback | undefined;

	if (typeof first === 'function') {
		callback = first as GenericCallback;
	} else if (typeof first === 'number' || typeof first === 'string') {
		callback = (item: PlainObject) => item[first];
	}

	if (callback == null) {
		return false;
	}

	return array.some((item, index, array) => Object.is(callback(item, index, array), second));
}

// #endregion
