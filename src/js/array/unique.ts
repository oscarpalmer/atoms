import {findValues} from '../internal/array-find';
import type {Key} from '../models';
import type {KeyCallback} from './models';

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

export function unique<Value>(
	array: Value[],
	key?: Key | KeyCallback<Value>,
): Value[] {
	return findValues('unique', array, undefined, key);
}
