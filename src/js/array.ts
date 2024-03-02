import {PlainObject} from './is';
import {Key} from './value';

type BooleanCallback<T> = (item: T, index: number, array: T[]) => boolean;

type Callbacks<T> = {
	bool?: BooleanCallback<T>;
	key?: KeyCallback<T>;
};

type FindType = 'index' | 'value';

type InsertType = 'push' | 'splice';

type KeyCallback<T> = (item: T) => Key;

function _getCallbacks<T>(
	bool: unknown,
	key: unknown,
): Callbacks<T> | undefined {
	if (typeof bool === 'function') {
		return {bool: bool as BooleanCallback<T>};
	}

	if (typeof key === 'function') {
		return {key: key as KeyCallback<T>};
	}

	const isString = typeof key === 'string';

	if (
		(!isString && typeof key !== 'number') ||
		(isString && key.includes('.'))
	) {
		return;
	}

	return {
		key: (item: T) => (item as PlainObject)?.[key as string] as Key,
	};
}

function _findValue<T1, T2 = T1>(
	type: FindType,
	array: T1[],
	value: T2 | BooleanCallback<T1>,
	key?: Key | KeyCallback<T1>,
): unknown {
	const callbacks = _getCallbacks(value, key);

	if (callbacks?.bool === undefined && callbacks?.key === undefined) {
		return type === 'index'
			? array.indexOf(value as T1)
			: array.find(item => item === value);
	}

	if (callbacks.bool !== undefined) {
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

function _findValues<T1, T2 = T1>(
	type: 'all' | 'unique',
	array: T1[],
	value: T2 | BooleanCallback<T1>,
	key?: Key | KeyCallback<T1>,
): T1[] {
	const callbacks = _getCallbacks(value, key);

	const {length} = array;

	if (type === 'unique' && callbacks?.key === undefined && length >= 100) {
		return Array.from(new Set(array));
	}

	if (typeof callbacks?.bool === 'function') {
		return array.filter(callbacks.bool);
	}

	if (type === 'all' && key === undefined) {
		return array.filter(item => item === value);
	}

	const hasCallback = typeof callbacks?.key === 'function';

	const result: T1[] = [];

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

function _insertValues<T>(
	type: InsertType,
	array: T[],
	values: T[],
	start: number,
	deleteCount: number,
): unknown {
	const chunked = chunk(values).reverse();
	const {length} = chunked;

	let index = 0;
	let returned: T[] | undefined;

	for (; index < length; index += 1) {
		const result = array.splice(
			start,
			index === 0 ? deleteCount : 0,
			...chunked[index],
		);

		if (returned === undefined) {
			returned = result;
		}
	}

	return type === 'splice' ? returned : array.length;
}

/**
 * Chunks an array into smaller arrays of a specified size
 */
export function chunk<T>(array: T[], size?: number): T[][] {
	const {length} = array;

	const chunkSize = typeof size === 'number' && size > 0 ? size : 32_000;

	if (length <= chunkSize) {
		return [array];
	}

	const chunks: T[][] = [];

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
export function exists<T1, T2>(
	array: T1[],
	value: T2 | BooleanCallback<T1>,
): boolean;

/**
 * - Does the value exist in array?
 * - Use `key` to find a comparison value to match with `value`
 */
export function exists<T1, T2 = T1>(
	array: T1[],
	value: T2,
	key: Key | KeyCallback<T1>,
): boolean;

/**
 * Does the value exist in array?
 */
export function exists<T1, T2 = T1>(
	array: T1[],
	value: T2 | BooleanCallback<T1>,
	key?: Key | KeyCallback<T1>,
): boolean {
	return (_findValue('index', array, value, key) as number) > -1;
}

/**
 * Returns a filtered array of items matching `value`
 */
export function filter<T1, T2>(
	array: T1[],
	value: T2 | BooleanCallback<T1>,
): T1[];

/**
 * - Returns a filtered array of items
 * - Use `key` to find a comparison value to match with `value`
 */
export function filter<T1, T2 = T1>(
	array: T1[],
	value: T2,
	key: Key | KeyCallback<T1>,
): T1[];

/**
 * Returns a filtered array of items
 */
export function filter<T1, T2 = T1>(
	array: T1[],
	value: T2 | BooleanCallback<T1>,
	key?: Key | KeyCallback<T1>,
): T1[] {
	return _findValues('all', array, value, key);
}

/**
 * Returns the first item matching `value`, or `undefined` if no match is found
 */
export function find<T1, T2>(
	array: T1[],
	value: T2 | BooleanCallback<T1>,
): T1 | undefined;

/**
 * - Returns the first matching item, or `undefined` if no match is found
 * - Use `key` to find a comparison value to match with `value`
 */
export function find<T1, T2 = T1>(
	array: T1[],
	value: T2,
	key: Key | KeyCallback<T1>,
): T1 | undefined;

/**
 * - Returns the first matching item, or `undefined` if no match is found
 */
export function find<T1, T2 = T1>(
	array: T1[],
	value: T2 | BooleanCallback<T1>,
	key?: Key | KeyCallback<T1>,
): T1 | undefined {
	return _findValue('value', array, value, key) as T1 | undefined;
}

/**
 * Groups an array of items using a key or callback
 */
export function groupBy<T>(
	array: T[],
	key: Key | KeyCallback<T>,
): Record<Key, T[]> {
	const callbacks = _getCallbacks(undefined, key);

	if (callbacks?.key === undefined) {
		return {};
	}

	const grouped: Record<Key, T[]> = {};

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
export function indexOf<T1, T2>(
	array: T1[],
	value: T2 | BooleanCallback<T1>,
): number;

/**
 * - Returns the index for the first matching item, or `-1` if no match is found
 * - Use `key` to find a comparison value to match with `value`
 */
export function indexOf<T1, T2 = T1>(
	array: T1[],
	value: T2,
	key: Key | KeyCallback<T1>,
): number;

/**
 * Returns the index of the first matching item, or `-1` if no match is found
 */
export function indexOf<T1, T2 = T1>(
	array: T1[],
	value: T2 | BooleanCallback<T1>,
	key?: Key | KeyCallback<T1>,
): number {
	return _findValue('index', array, value, key) as number;
}

/**
 * - Inserts values into an array at a specified index
 * - Uses chunking to avoid stack overflow
 */
export function insert<T>(array: T[], index: number, values: T[]): void {
	_insertValues('splice', array, values, index, 0);
}

/**
 * - Pushes values to the end of an array
 * - Uses chunking to avoid stack overflow
 */
export function push<T>(array: T[], values: T[]): number {
	return _insertValues('push', array, values, array.length, 0) as number;
}

/**
 * - Splices values into an array and returns any removed values
 * - Uses chunking to avoid stack overflow
 */
export function splice<T>(
	array: T[],
	start: number,
	deleteCount: number,
	values: T[],
): T[] {
	return _insertValues('splice', array, values, start, deleteCount) as T[];
}

/**
 * Returns an array of unique items
 */
export function unique<T>(array: T[]): T[];

/**
 * - Returns an array of unique items
 * - Use `key` to find a comparison value to match with `value`
 */
export function unique<T>(array: T[], key: Key | KeyCallback<T>): T[];

/**
 * Returns an array of unique items
 */
export function unique<T>(array: T[], key?: Key | KeyCallback<T>): T[] {
	return _findValues('unique', array, undefined, key);
}
