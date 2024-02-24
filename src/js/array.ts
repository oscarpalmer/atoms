import {Key} from './value';

type KeyCallback<T> = (item: T) => Key;

type InsertType = 'push' | 'splice';

function _getCallback<T>(
	value: Key | KeyCallback<T> | undefined,
): KeyCallback<T> | undefined {
	if (typeof value === 'function') {
		return value;
	}

	const isString = typeof value === 'string';

	if (!isString && typeof value !== 'number') {
		return;
	}

	return isString && value.includes('.')
		? undefined
		: (item: T): Key => item[value as never];
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
 * Does the value exist in the array?
 * - `key` is optional and can be used to specify a key or callback for finding a key for comparisons
 * - If `key` is not provided, the item itself is used for comparisons
 */
export function exists<T1, T2 = T1>(
	array: T1[],
	value: T2,
	key?: Key | KeyCallback<T1>,
): boolean {
	const callback = _getCallback(key);

	if (callback === undefined) {
		return array.indexOf(value as never) > -1;
	}

	const needle =
		typeof value === 'object' && value !== null
			? callback(value as never)
			: value;

	const {length} = array;

	let index = 0;

	for (; index < length; index += 1) {
		if (callback(array[index]) === needle) {
			return true;
		}
	}

	return false;
}

/**
 * Groups an array of items using a key or callback
 */
export function groupBy<T>(
	array: T[],
	key: Key | ((item: T) => Key),
): Record<Key, T[]> {
	const keyCallback = _getCallback(key) as KeyCallback<T>;

	if (keyCallback === undefined) {
		return {};
	}

	const grouped: Record<Key, T[]> = {};

	const {length} = array;

	let index = 0;

	for (; index < length; index += 1) {
		const item = array[index];
		const value = keyCallback(item);

		if (value in grouped) {
			grouped[value].push(item);
		} else {
			grouped[value] = [item];
		}
	}

	return grouped;
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
 * - Returns a new array with unique items
 * - `key` is optional and can be used to specify a key or callback for finding a key for uniqueness
 * - If `key` is not provided, the item itself is used for comparisons
 * - Inspired by Lodash :-)
 */
export function unique<T>(array: T[], key?: Key | ((item: T) => Key)): T[] {
	const keyCallback = _getCallback(key);

	const {length} = array;

	if (keyCallback === undefined && length >= 100) {
		return Array.from(new Set(array));
	}

	const result: T[] = [];

	const values: unknown[] = keyCallback === undefined ? result : [];

	let index = 0;

	for (; index < length; index += 1) {
		const item = array[index];
		const value = keyCallback?.(item) ?? item;

		if (values.indexOf(value) === -1) {
			if (values !== result) {
				values.push(value);
			}

			result.push(item);
		}
	}

	return result;
}
