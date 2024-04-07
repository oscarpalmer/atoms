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

function _getCallbacks<Value>(
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

function _findValue<Model, Value = Model>(
	type: FindType,
	array: Model[],
	value: Value | BooleanCallback<Model>,
	key?: Key | KeyCallback<Model>,
): unknown {
	const callbacks = _getCallbacks(value, key);

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

	let index = 0;

	for (; index < length; index += 1) {
		const item = array[index];

		if (callbacks.key?.(item) === value) {
			return type === 'index' ? index : item;
		}
	}

	return type === 'index' ? -1 : undefined;
}

function _findValues<Model, Value = Model>(
	type: 'all' | 'unique',
	array: Model[],
	value: Value | BooleanCallback<Model>,
	key?: Key | KeyCallback<Model>,
): Model[] {
	const callbacks = _getCallbacks(value, key);

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

	let index = 0;

	for (; index < length; index += 1) {
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

function _insertValues<Value>(
	type: InsertType,
	array: Value[],
	values: Value[],
	start: number,
	deleteCount: number,
): unknown {
	const chunked = chunk(values).reverse();
	const {length} = chunked;

	let index = 0;
	let returned: Value[] | undefined;

	for (; index < length; index += 1) {
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
	return (_findValue('index', array, value, key) as number) > -1;
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
	return _findValues('all', array, value, key);
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
	return _findValue('value', array, value, key) as Model | undefined;
}

/**
 * Groups an array of items using a key or callback
 */
export function groupBy<Value>(
	array: Value[],
	key: Key | KeyCallback<Value>,
): Record<Key, Value[]> {
	const callbacks = _getCallbacks(undefined, key);

	if (callbacks?.key == null) {
		return {};
	}

	const grouped: Record<Key, Value[]> = {};

	const {length} = array;

	let index = 0;

	for (; index < length; index += 1) {
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
	return _findValue('index', array, value, key) as number;
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
	_insertValues('splice', array, values, index, 0);
}

/**
 * - Pushes values to the end of an array
 * - Uses chunking to avoid stack overflow
 */
export function push<Value>(array: Value[], values: Value[]): number {
	return _insertValues('push', array, values, array.length, 0) as number;
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

	return _insertValues(
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
	return _findValues('unique', array, undefined, key);
}
