import {isKey} from './is';
import type {Key, PlainObject} from './models';

type BooleanCallback<Value> = GenericCallback<Value, boolean>;

type Callbacks<Value> = {
	bool?: BooleanCallback<Value>;
	key?: KeyCallback<Value>;
};

type FindType = 'index' | 'value';

type GenericCallback<Value, Returned> = (
	value: Value,
	index: number,
	array: Value[],
) => Returned;

type InsertType = 'push' | 'splice';

type KeyCallback<Value> = GenericCallback<Value, Key>;

type SortKey<Value> = {
	direction: 'asc' | 'desc';
	value: Key | SortKeyCallback<Value>;
};

type SortKeyCallback<Value> = (value: Value) => Key;

type SortKeyWithCallback<Value> = {
	callback: SortKeyCallback<Value>;
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
	if (typeof first === 'number' && typeof second === 'number') {
		return first - second;
	}

	const firstAsNumber = Number(first);
	const secondAsNumber = Number(second);

	return Number.isNaN(firstAsNumber) || Number.isNaN(secondAsNumber)
		? String(first).localeCompare(String(second))
		: firstAsNumber - secondAsNumber;
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

		if (callbacks.key?.(item, index, array) === value) {
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
		const itemKey = hasCallback ? callbacks.key?.(item, index, array) : item;

		if (
			(type === 'all' && itemKey === value) ||
			(type === 'unique' && values.indexOf(itemKey) === -1)
		) {
			if (values !== result) {
				values.push(itemKey);
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

/**
 * Groups an array of items using a key or callback
 */
export function groupBy<Value>(
	array: Value[],
	key: Key | KeyCallback<Value>,
): Record<Key, Value[]> {
	return groupValues(array, key, true, false) as never;
}

function groupValues<Value>(
	array: Value[],
	key: Key | KeyCallback<Value>,
	arrays: boolean,
	indicable: boolean,
): Record<Key, unknown> {
	const callbacks = getCallbacks(undefined, key);
	const hasCallback = typeof callbacks?.key === 'function';

	if (!hasCallback && !indicable) {
		return {};
	}

	const record: Record<Key, unknown> = {};
	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const value = array[index];

		const key = hasCallback
			? callbacks?.key?.(value, index, array) ?? index
			: index;

		if (arrays) {
			const existing = record[key];

			if (Array.isArray(existing)) {
				existing.push(value);
			} else {
				record[key] = [value];
			}
		} else {
			record[key] = value;
		}
	}

	return record;
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
	key: Key | SortKey<Value> | SortKeyCallback<Value>,
	descending?: boolean,
): Value[];

/**
 * - Sorts an array of items, using multiple `keys` to sort by specific values
 * - Ascending by default, but can be changed by setting `descending` to `true`, or using `SortKey`
 */
export function sort<Value>(
	array: Value[],
	keys: Array<Key | SortKey<Value> | SortKeyCallback<Value>>,
	descending?: boolean,
): Value[];

export function sort<Value>(
	array: Value[],
	first?:
		| boolean
		| Key
		| SortKey<Value>
		| SortKeyCallback<Value>
		| Array<Key | SortKey<Value> | SortKeyCallback<Value>>,
	second?: boolean,
): Value[] {
	if (array.length < 2) {
		return array;
	}

	if (first == null || typeof first === 'boolean') {
		return first === true
			? (array as never[]).sort((first, second) => second - first)
			: array.sort();
	}

	const direction = second === true ? 'desc' : 'asc';

	const keys = (Array.isArray(first) ? first : [first])
		.map(key => {
			const returned: SortKeyWithCallback<Value> = {
				direction,
				callback: undefined as never,
			};

			if (isKey(key)) {
				returned.callback = (value: Value) =>
					(value as PlainObject)[key] as never;
			} else if (typeof key === 'function') {
				returned.callback = key;
			} else if (typeof key?.value === 'function' || isKey(key?.value)) {
				returned.direction = key?.direction ?? direction;
				returned.callback =
					typeof key.value === 'function'
						? key.value
						: (value: Value) =>
								(value as PlainObject)[key.value as Key] as never;
			}

			return returned;
		})
		.filter(key => typeof key.callback === 'function');

	const {length} = keys;

	if (length === 0) {
		return direction === 'asc'
			? array.sort()
			: (array as never[]).sort((first, second) => second - first);
	}

	if (length === 1) {
		return array.sort(
			(first, second) =>
				comparison(keys[0].callback(first), keys[0].callback(second)) *
				(keys[0].direction === 'asc' ? 1 : -1),
		);
	}

	const sorted = array.sort((first, second) => {
		for (let index = 0; index < length; index += 1) {
			const {callback, direction} = keys[index];

			const descending = direction === 'desc';

			const compared = comparison(
				callback(descending ? second : first),
				callback(descending ? first : second),
			);

			if (compared !== 0) {
				return compared;
			}
		}

		return 0;
	});

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
 * Converts an array into a map, using indices as keys
 */
export function toMap<Value>(array: Value[]): Map<number, Value>;

/**
 * Converts an array into a map, using indices as keys and grouping values into arrays
 */
export function toMap<Value>(
	array: Value[],
	arrays: true,
): Map<number, Value[]>;

/**
 * - Converts an array into a map
 * - Uses `key` to find an identifcation value to use as keys
 */
export function toMap<Value>(array: Value[], key: Key): Map<Key, Value>;

/**
 * - Converts an array into a map
 * - Uses `key` to find an identifcation value to use as keys
 * - Groups values into arrays
 */
export function toMap<Value>(
	array: Value[],
	key: Key,
	arrays: true,
): Map<Key, Value[]>;

/**
 * - Converts an array into a map
 * - Uses `key` to find an identifcation value to use as keys
 */
export function toMap<Value>(
	array: Value[],
	key: KeyCallback<Value>,
): Map<Key, Value>;

/**
 * - Converts an array into a map
 * - Uses `key` to find an identifcation value to use as keys
 * - Groups values into arrays
 */
export function toMap<Value>(
	array: Value[],
	key: KeyCallback<Value>,
	arrays: true,
): Map<Key, Value[]>;

export function toMap<Value>(
	array: Value[],
	first?: boolean | Key | KeyCallback<Value>,
	second?: boolean,
): Map<Key, unknown> {
	const asArrays = first === true || second === true;
	const callbacks = getCallbacks(undefined, first);
	const hasCallback = typeof callbacks?.key === 'function';
	const map = new Map<Key, unknown>();
	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const value = array[index];

		const key = hasCallback
			? callbacks?.key?.(value, index, array) ?? index
			: index;

		if (asArrays) {
			const existing = map.get(key);

			if (Array.isArray(existing)) {
				existing.push(value);
			} else {
				map.set(key, [value]);
			}
		} else {
			map.set(key, value);
		}
	}

	return map;
}

/**
 * Converts an array into a record, using indices as keys
 */
export function toRecord<Value>(array: Value[]): Record<number, Value>;

/**
 * Converts an array into a record, using indices as keys and grouping values into arrays
 */
export function toRecord<Value>(
	array: Value[],
	arrays: true,
): Record<number, Value[]>;

/**
 * - Converts an array into a record
 * - Uses `key` to find an identifcation value to use as keys
 */
export function toRecord<Value>(array: Value[], key: Key): Record<Key, Value>;

/**
 * - Converts an array into a record
 * - Uses `key` to find an identifcation value to use as keys
 * - Groups values into arrays
 */
export function toRecord<Value>(
	array: Value[],
	key: Key,
	arrays: true,
): Record<Key, Value[]>;

/**
 * - Converts an array into a record
 * - Uses `key` to find an identifcation value to use as keys
 */
export function toRecord<Value>(
	array: Value[],
	key: KeyCallback<Value>,
): Record<Key, Value>;

/**
 * - Converts an array into a record
 * - Uses `key` to find an identifcation value to use as keys
 * - Groups values into arrays
 */
export function toRecord<Value>(
	array: Value[],
	key: KeyCallback<Value>,
	arrays: true,
): Record<Key, Value[]>;

export function toRecord<Value>(
	array: Value[],
	first?: boolean | Key | KeyCallback<Value>,
	second?: boolean,
): Record<Key, unknown> {
	return groupValues(
		array,
		first as Key | KeyCallback<Value>,
		first === true || second === true,
		true,
	);
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
