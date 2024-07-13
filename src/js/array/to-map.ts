import {getCallbacks} from '../internal/array-callbacks';
import type {Key} from '../models';
import type {KeyCallback} from './models';

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
