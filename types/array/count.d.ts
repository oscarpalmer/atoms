import type { Key } from '../models';
import type { BooleanCallback, KeyCallback } from './models';
/**
 * Returns the number of items _(count)_ that match the given value
 */
export declare function count<Model, Value>(array: Model[], value: Value | BooleanCallback<Model>): number;
/**
 * - Returns the number of items _(count)_ that match the given value
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function count<Model, Value = Model>(array: Model[], value: Value, key: Key | KeyCallback<Model>): number;
