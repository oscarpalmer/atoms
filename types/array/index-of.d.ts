import type { Key } from '../models';
import type { BooleanCallback, KeyCallback } from './models';
/**
 * Returns the index for the first item matching `value`, or `-1` if no match is found
 */
export declare function indexOf<Model, Value>(array: Model[], value: Value | BooleanCallback<Model>): number;
/**
 * - Returns the index for the first matching item, or `-1` if no match is found
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function indexOf<Model, Value = Model>(array: Model[], value: Value, key: Key | KeyCallback<Model>): number;
