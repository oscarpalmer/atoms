import {findValue} from '../internal/array-find';
import type {Key} from '../models';
import type {BooleanCallback, KeyCallback} from './models';

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
