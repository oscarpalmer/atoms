import type { Key } from '../models';
import type { KeyCallback } from './models';
/**
 * Returns an array of unique items
 */
export declare function unique<Value>(array: Value[]): Value[];
/**
 * - Returns an array of unique items
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function unique<Value>(array: Value[], key: Key | KeyCallback<Value>): Value[];
