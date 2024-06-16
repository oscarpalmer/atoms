import type {Key, PlainObject} from './models';

type BooleanCallback<Value> = (
	value: Value,
	index: number,
	array: Value[],
) => boolean;

type Callbacks<Value> = {
	bool?: BooleanCallback<Value>;
	key?: KeyCallback<Value>;
};

type FindType = 'index' | 'value';

type InsertType = 'push' | 'splice';

type KeyCallback<Value> = (value: Value) => Key;

type SortKey = {
	direction: 'asc' | 'desc';
	value: Key;
};

type SortKeyWithCallback<Value> = {
	callback?: KeyCallback<Value>;
	direction: 'asc' | 'desc';
};

/**
 * Chunks an array into smaller arrays of a specified size
 */
export function chunk<Value>(array: Value[], size?: number): Value[][] {
	const {length} = array;

	const chunkSize = typeof size === 'number' && size > 0 ? size : 32_000;

	if (length <= chunkSize) {
		return [array];
	}

	const chunks: Value[][] = [];

	let remaining = Number(length);

	while (remaining > 0) {
		chunks.push(array.splice(0, chunkSize));

		remaining -= chunkSize;
	}

	return chunks;
}

function comparison(first: unknown, second: unknown): number {
	return [first, second].every(value =>
		['bigint', 'boolean', 'date', 'number'].includes(typeof value),
	)
		? Number(first) - Number(second)
		: String(first).localeCompare(String(second));
}

/**
 * Does the value exist in array?
 */
export function exists<Model, Value>(
	array: Model[],
	value: Value | BooleanCallback<Model>,
): boolean;

/**
 * - Does the value exist in array?
 * - Use `key` to find a comparison value to match with `value`
 */
export function exists<Model, Value = Model>(
	array: Model[],
	value: Value,
	key: Key | KeyCallback<Model>,
): boolean;

/**
 * Does the value exist in array?
 */
export function exists<Model, Value = Model>(
	array: Model[],
	value: Value | BooleanCallback<Model>,
	key?: Key | KeyCallback<Model>,
): boolean {
	return (findValue('index', array, value, key) as number) > -1;
}

/**
 * Returns a filtered array of items matching `value`
 */
export function filter<Model, Value>(
	array: Model[],
	value: Value | BooleanCallback<Model>,
): Model[];

/**
 * - Returns a filtered array of items
 * - Use `key` to find a comparison value to match with `value`
 */
export function filter<Model, Value = Model>(
	array: Model[],
	value: Value,
	key: Key | KeyCallback<Model>,
): Model[];

/**
 * Returns a filtered array of items
 */
export function filter<Model, Value = Model>(
	array: Model[],
	value: Value | BooleanCallback<Model>,
	key?: Key | KeyCallback<Model>,
): Model[] {
	return findValues('all', array, value, key);
}

/**
 * Returns the first item matching `value`, or `undefined` if no match is found
 */
export function find<Model, Value>(
	array: Model[],
	value: Value | BooleanCallback<Model>,
): Model | undefined;

/**
 * - Returns the first matching item, or `undefined` if no match is found
 * - Use `key` to find a comparison value to match with `value`
 */
export function find<Model, Value = Model>(
	array: Model[],
	value: Value,
	key: Key | KeyCallback<Model>,
): Model | undefined;

/**
 * - Returns the first matching item, or `undefined` if no match is found
 */
export function find<Model, Value = Model>(
	array: Model[],
	value: Value | BooleanCallback<Model>,
	key?: Key | KeyCallback<Model>,
): Model | undefined {
	return findValue('value', array, value, key) as Model | undefined;
}

function findValue<Model, Value = Model>(
	type: FindType,
	array: Model[],
	value: Value | BooleanCallback<Model>,
	key?: Key | KeyCallback<Model>,
): unknown {
	const callbacks = getCallbacks(value, key);

	if (callbacks?.bool == null && callbacks?.key == null) {
		return type === 'index'
			? array.indexOf(value as Model)
			: array.find(item => item === value);
	}

	if (callbacks.bool != null) {
		const index = array.findIndex(callbacks.bool);

		return type === 'index' ? index : index > -1 ? array[index] : undefined;
	}

	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		if (callbacks.key?.(item) === value) {
			return type === 'index' ? index : item;
		}
	}

	return type === 'index' ? -1 : undefined;
}

function findValues<Model, Value = Model>(
	type: 'all' | 'unique',
	array: Model[],
	value: Value | BooleanCallback<Model>,
	key?: Key | KeyCallback<Model>,
): Model[] {
	const callbacks = getCallbacks(value, key);

	const {length} = array;

	if (type === 'unique' && callbacks?.key == null && length >= 100) {
		return Array.from(new Set(array));
	}

	if (typeof callbacks?.bool === 'function') {
		return array.filter(callbacks.bool);
	}

	if (type === 'all' && key == null) {
		return array.filter(item => item === value);
	}

	const hasCallback = typeof callbacks?.key === 'function';
	const result: Model[] = [];
	const values: unknown[] = hasCallback ? [] : result;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];
		const itemValue = hasCallback ? callbacks.key?.(item) : item;

		if (
			(type === 'all' && itemValue === value) ||
			(type === 'unique' && values.indexOf(itemValue) === -1)
		) {
			if (values !== result) {
				values.push(itemValue);
			}

			result.push(item);
		}
	}

	return result;
}

function getCallbacks<Value>(
	bool: unknown,
	key: unknown,
): Callbacks<Value> | undefined {
	if (typeof bool === 'function') {
		return {bool: bool as BooleanCallback<Value>};
	}

	if (typeof key === 'function') {
		return {key: key as KeyCallback<Value>};
	}

	const isString = typeof key === 'string';

	if (
		(!isString && typeof key !== 'number') ||
		(isString && key.includes('.'))
	) {
		return;
	}

	return {
		key: (value: Value) => (value as PlainObject)?.[key as string] as Key,
	};
}

function getSortedValue<Value>(
	map: Map<Value, Map<KeyCallback<Value>, unknown>>,
	value: Value,
	callback: KeyCallback<Value>,
): unknown {
	if (!map.has(value)) {
		map.set(value, new Map());
	}

	const stored = map.get(value);

	if (stored?.has(callback)) {
		return stored.get(callback);
	}

	const result = callback?.(value) ?? value;

	stored?.set(callback, result);

	return result;
}

/**
 * Groups an array of items using a key or callback
 */
export function groupBy<Value>(
	array: Value[],
	key: Key | KeyCallback<Value>,
): Record<Key, Value[]> {
	const callbacks = getCallbacks(undefined, key);

	if (callbacks?.key == null) {
		return {};
	}

	const grouped: Record<Key, Value[]> = {};
	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];
		const value = callbacks.key(item);

		if (value in grouped) {
			grouped[value].push(item);
		} else {
			grouped[value] = [item];
		}
	}

	return grouped;
}

/**
 * Returns the index for the first item matching `value`, or `-1` if no match is found
 */
export function indexOf<Model, Value>(
	array: Model[],
	value: Value | BooleanCallback<Model>,
): number;

/**
 * - Returns the index for the first matching item, or `-1` if no match is found
 * - Use `key` to find a comparison value to match with `value`
 */
export function indexOf<Model, Value = Model>(
	array: Model[],
	value: Value,
	key: Key | KeyCallback<Model>,
): number;

/**
 * Returns the index of the first matching item, or `-1` if no match is found
 */
export function indexOf<Model, Value = Model>(
	array: Model[],
	value: Value | BooleanCallback<Model>,
	key?: Key | KeyCallback<Model>,
): number {
	return findValue('index', array, value, key) as number;
}

/**
 * - Inserts values into an array at a specified index
 * - Uses chunking to avoid stack overflow
 */
export function insert<Value>(
	array: Value[],
	index: number,
	values: Value[],
): void {
	insertValues('splice', array, values, index, 0);
}

function insertValues<Value>(
	type: InsertType,
	array: Value[],
	values: Value[],
	start: number,
	deleteCount: number,
): unknown {
	const chunked = chunk(values).reverse();
	const {length} = chunked;

	let returned: Value[] | undefined;

	for (let index = 0; index < length; index += 1) {
		const result = array.splice(
			start,
			index === 0 ? deleteCount : 0,
			...chunked[index],
		);

		if (returned == null) {
			returned = result;
		}
	}

	return type === 'splice' ? returned : array.length;
}

/**
 * - Pushes values to the end of an array
 * - Uses chunking to avoid stack overflow
 */
export function push<Value>(array: Value[], values: Value[]): number {
	return insertValues('push', array, values, array.length, 0) as number;
}

/**
 * Sorts an array of items _(ascending by default)_
 */
export function sort<Value>(array: Value[], descending?: boolean): Value[];

/**
 * - Sorts an array of items, using a `key` to sort by a specific value
 * - Ascending by default, but can be changed by setting `descending` to `true`, or using a `SortKey`
 */
export function sort<Value>(
	array: Value[],
	key: Key | SortKey | KeyCallback<Value>,
	descending?: boolean,
): Value[];

/**
 * - Sorts an array of items, using multiple `keys` to sort by specific values
 * - Ascending by default, but can be changed by setting `descending` to `true`, or using `SortKey`
 */
export function sort<Value>(
	array: Value[],
	keys: Array<Key | SortKey | KeyCallback<Value>>,
	descending?: boolean,
): Value[];

export function sort<Value>(
	array: Value[],
	first?:
		| boolean
		| Key
		| SortKey
		| KeyCallback<Value>
		| Array<Key | SortKey | KeyCallback<Value>>,
	second?: boolean,
): Value[] {
	if (first == null || typeof first === 'boolean') {
		return first === true
			? (array as never[]).sort((first, second) => second - first)
			: array.sort();
	}

	const direction = second === true ? 'desc' : 'asc';

	const keys = (Array.isArray(first) ? first : [first])
		.map(key => {
			if (typeof key === 'object') {
				return 'value' in key
					? {
							direction: key.direction,
							callback: getCallbacks(null, key.value)?.key,
						}
					: null;
			}

			return {
				direction,
				callback: getCallbacks(null, key)?.key,
			} as SortKeyWithCallback<Value>;
		})
		.filter(
			key => typeof key?.callback === 'function',
		) as SortKeyWithCallback<Value>[];

	const {length} = keys;

	if (length === 0) {
		return second === true
			? (array as never[]).sort((first, second) => second - first)
			: array.sort();
	}

	const store = new Map<Value, Map<KeyCallback<Value>, unknown>>();

	const sorted = array.sort((first, second) => {
		for (let index = 0; index < length; index += 1) {
			const {callback, direction} = keys[index] as SortKeyWithCallback<Value>;

			if (callback == null) {
				continue;
			}

			const compared =
				comparison(
					getSortedValue(store, first, callback),
					getSortedValue(store, second, callback),
				) * (direction === 'asc' ? 1 : -1);

			if (compared !== 0) {
				return compared;
			}
		}

		return 0;
	});

	store.clear();

	return sorted;
}

/**
 * Removes and returns all items from an array starting from a specific index
 */
export function splice<Value>(array: Value[], start: number): Value[];

/**
 * Removes and returns _(up to)_ a specific amount of items from an array, starting from a specific index
 */
export function splice<Value>(
	array: Value[],
	start: number,
	amount: number,
): Value[];

/**
 * - Splices values into an array and returns any removed values
 * - Uses chunking to avoid stack overflow
 */
export function splice<Value>(
	array: Value[],
	start: number,
	values: Value[],
): Value[];

/**
 * - Splices values into an array and returns any removed values
 * - Uses chunking to avoid stack overflow
 */
export function splice<Value>(
	array: Value[],
	start: number,
	amount: number,
	values: Value[],
): Value[];

export function splice<Value>(
	array: Value[],
	start: number,
	amountOrValues?: number | Value[],
	values?: Value[],
): Value[] {
	const amoutOrValuesIsArray = Array.isArray(amountOrValues);

	return insertValues(
		'splice',
		array,
		amoutOrValuesIsArray ? amountOrValues : values ?? [],
		start,
		amoutOrValuesIsArray
			? array.length
			: typeof amountOrValues === 'number' && amountOrValues > 0
				? amountOrValues
				: 0,
	) as Value[];
}

/**
 * Returns an array of unique items
 */
export function unique<Value>(array: Value[]): Value[];

/**
 * - Returns an array of unique items
 * - Use `key` to find a comparison value to match with `value`
 */
export function unique<Value>(
	array: Value[],
	key: Key | KeyCallback<Value>,
): Value[];

/**
 * Returns an array of unique items
 */
export function unique<Value>(
	array: Value[],
	key?: Key | KeyCallback<Value>,
): Value[] {
	return findValues('unique', array, undefined, key);
}
