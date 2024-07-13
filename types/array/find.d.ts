import type { Key } from '../models';
import type { BooleanCallback, KeyCallback } from './models';
/**
 * Returns the first item matching `value`, or `undefined` if no match is found
 */
export declare function find<Model, Value>(array: Model[], value: Value | BooleanCallback<Model>): Model | undefined;
/**
 * - Returns the first matching item, or `undefined` if no match is found
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function find<Model, Value = Model>(array: Model[], value: Value, key: Key | KeyCallback<Model>): Model | undefined;
