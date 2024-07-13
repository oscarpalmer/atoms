import type { Key } from '../models';
import type { KeyCallback } from './models';
/**
 * Groups an array of items using a key or callback
 */
export declare function groupBy<Value>(array: Value[], key: Key | KeyCallback<Value>): Record<Key, Value[]>;
export declare function groupValues<Value>(array: Value[], key: Key | KeyCallback<Value>, arrays: boolean, indicable: boolean): Record<Key, unknown>;
