import type {BooleanCallback, KeyCallback} from '@/array/models';
import {findValues} from '@/internal/array-find';
import type {Key} from '@/models';

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

export function filter<Model, Value = Model>(
	array: Model[],
	value: Value | BooleanCallback<Model>,
	key?: Key | KeyCallback<Model>,
): Model[] {
	return findValues('all', array, value, key);
}
