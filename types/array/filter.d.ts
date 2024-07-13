import type { Key } from '../models';
import type { BooleanCallback, KeyCallback } from './models';
/**
 * Returns a filtered array of items matching `value`
 */
export declare function filter<Model, Value>(array: Model[], value: Value | BooleanCallback<Model>): Model[];
/**
 * - Returns a filtered array of items
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function filter<Model, Value = Model>(array: Model[], value: Value, key: Key | KeyCallback<Model>): Model[];
