import type { Key } from '../models';
import type { SortKey, SortKeyCallback } from './models';
/**
 * Sorts an array of items _(ascending by default)_
 */
export declare function sort<Value>(array: Value[], descending?: boolean): Value[];
/**
 * - Sorts an array of items, using a `key` to sort by a specific value
 * - Ascending by default, but can be changed by setting `descending` to `true`, or using a `SortKey`
 */
export declare function sort<Value>(array: Value[], key: Key | SortKey<Value> | SortKeyCallback<Value>, descending?: boolean): Value[];
/**
 * - Sorts an array of items, using multiple `keys` to sort by specific values
 * - Ascending by default, but can be changed by setting `descending` to `true`, or using `SortKey`
 */
export declare function sort<Value>(array: Value[], keys: Array<Key | SortKey<Value> | SortKeyCallback<Value>>, descending?: boolean): Value[];
