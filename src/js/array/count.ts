import type {BooleanCallback, KeyCallback} from '@/array/models';
import {findValues} from '@/internal/array-find';
import type {Key} from '@/models';

/**
 * Returns the number of items _(count)_ that match the given value
 */
export function count<Model, Value>(
	array: Model[],
	value: Value | BooleanCallback<Model>,
): number;

/**
 * - Returns the number of items _(count)_ that match the given value
 * - Use `key` to find a comparison value to match with `value`
 */
export function count<Model, Value = Model>(
	array: Model[],
	value: Value,
	key: Key | KeyCallback<Model>,
): number;

export function count<Model, Value = Model>(
	array: Model[],
	value: Value | BooleanCallback<Model>,
	key?: Key | KeyCallback<Model>,
): number {
	return findValues('all', array, value, key).length;
}
