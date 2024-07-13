import type { Key } from '../models';
import type { KeyCallback } from './models';
/**
 * Converts an array into a map, using indices as keys
 */
export declare function toMap<Value>(array: Value[]): Map<number, Value>;
/**
 * Converts an array into a map, using indices as keys and grouping values into arrays
 */
export declare function toMap<Value>(array: Value[], arrays: true): Map<number, Value[]>;
/**
 * - Converts an array into a map
 * - Uses `key` to find an identifcation value to use as keys
 */
export declare function toMap<Value>(array: Value[], key: Key): Map<Key, Value>;
/**
 * - Converts an array into a map
 * - Uses `key` to find an identifcation value to use as keys
 * - Groups values into arrays
 */
export declare function toMap<Value>(array: Value[], key: Key, arrays: true): Map<Key, Value[]>;
/**
 * - Converts an array into a map
 * - Uses `key` to find an identifcation value to use as keys
 */
export declare function toMap<Value>(array: Value[], key: KeyCallback<Value>): Map<Key, Value>;
/**
 * - Converts an array into a map
 * - Uses `key` to find an identifcation value to use as keys
 * - Groups values into arrays
 */
export declare function toMap<Value>(array: Value[], key: KeyCallback<Value>, arrays: true): Map<Key, Value[]>;
