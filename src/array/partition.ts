import type {GenericCallback, PlainObject} from '../models/misc.model';

// #region Functions

function getCallback(first: unknown, second: unknown, length: number): GenericCallback | undefined {
	if (length === 1 && typeof first === 'function') {
		return first as GenericCallback;
	}

	switch (true) {
		case length === 1:
			return (item: unknown) => Object.is(item, first);

		case typeof first === 'function':
			return (item: unknown, index: number, array: unknown[]) =>
				Object.is(first(item, index, array), second);

		case typeof first === 'number' || typeof first === 'string':
			return (item: PlainObject) => Object.is(item[first], second);

		default:
			return undefined;
	}
}

/**
 * Get a partitioned array of items
 *
 * @param array Array to search in
 * @param callback Callback to get an item's value for matching
 * @param value Value to match against
 * @returns Tuple of matching and non-matching items
 *
 * @example
 * ```typescript
 * partition(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   item => item.id,
 *   2,
 * ); // => [[{id: 2}], [{id: 1}, {id: 3}]]
 * ```
 */
export function partition<
	Item,
	Callback extends (item: Item, index: number, array: Item[]) => unknown,
>(array: Item[], callback: Callback, value: ReturnType<Callback>): [Item[], Item[]];

/**
 * Get a partitioned array of items
 *
 * @param array Array to search in
 * @param key Key to get an item's value for matching
 * @param value Value to match against
 * @returns Tuple of matching and non-matching items
 *
 * @example
 * ```typescript
 * partition(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   'id',
 *   2,
 * ); // => [[{id: 2}], [{id: 1}, {id: 3}]]
 * ```
 */
export function partition<Item extends PlainObject, ItemKey extends keyof Item>(
	array: Item[],
	key: ItemKey,
	value: Item[ItemKey],
): [Item[], Item[]];

/**
 * Get a partitioned array of items
 *
 * @param array Array to search in
 * @param filter Type guard to match and narrow down the items
 * @returns Tuple of matching and non-matching items
 *
 * @example
 * ```typescript
 * partition(
 *   [{id: 1, value: 10}, {id: 2, value: 'a'}, {id: 3, value: 'b'}],
 *   (item): item is {id: number; value: string} => typeof item.value === 'string',
 * ); // => [[{id: 2, value: 'a'}, {id: 3, value: 'b'}], [{id: 1, value: 10}]]
 * ```
 */
export function partition<Item, Narrowed extends Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => item is Narrowed,
): [Narrowed[], Array<Exclude<Item, Narrowed>>];

/**
 * Get a partitioned array of items
 *
 * @param array Array to search in
 * @param filter Filter callback to match items
 * @returns Tuple of matching and non-matching items
 *
 * @example
 * ```typescript
 * partition(
 *   [{id: 1}, {id: 2}, {id: 3}],
 *   item => item.id === 2,
 * ); // => [[{id: 2}], [{id: 1}, {id: 3}]]
 * ```
 */
export function partition<Item>(
	array: Item[],
	filter: (item: Item, index: number, array: Item[]) => boolean,
): [Item[], Item[]];

/**
 * Get a partitioned array of items matching the given item
 *
 * @param array Array to search in
 * @param item Item to match against
 * @returns Tuple of matching and non-matching items
 *
 * @example
 * ```typescript
 * partition([1, 2, 3, 4, 5], 3); // => [[3], [1, 2, 4, 5]]
 * ```
 */
export function partition<Item>(array: Item[], item: Item): [Item[], Item[]];

export function partition(array: unknown[], ...parameters: unknown[]): [unknown[], unknown[]] {
	if (!Array.isArray(array)) {
		return [[], []];
	}

	const arrayLength = array.length;

	if (arrayLength === 0) {
		return [[], []];
	}

	const parametersLength = parameters.length;
	const [first, second] = parameters;

	const callback = getCallback(first, second, parametersLength);

	if (callback == null) {
		return [[], []];
	}

	const matched: unknown[] = [];
	const notMatched: unknown[] = [];

	for (let index = 0; index < arrayLength; index += 1) {
		const item = array[index];

		if (callback(item, index, array)) {
			matched.push(item);
		} else {
			notMatched.push(item);
		}
	}

	return [matched, notMatched];
}

// #endregion
