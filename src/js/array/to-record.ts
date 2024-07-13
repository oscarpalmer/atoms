import type {Key} from '../models';
import {groupValues} from './group-by';
import type {KeyCallback} from './models';

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
