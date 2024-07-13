import type { Key } from '../models';
import type { KeyCallback } from './models';
/**
 * Converts an array into a record, using indices as keys
 */
export declare function toRecord<Value>(array: Value[]): Record<number, Value>;
/**
 * Converts an array into a record, using indices as keys and grouping values into arrays
 */
export declare function toRecord<Value>(array: Value[], arrays: true): Record<number, Value[]>;
/**
 * - Converts an array into a record
 * - Uses `key` to find an identifcation value to use as keys
 */
export declare function toRecord<Value>(array: Value[], key: Key): Record<Key, Value>;
/**
 * - Converts an array into a record
 * - Uses `key` to find an identifcation value to use as keys
 * - Groups values into arrays
 */
export declare function toRecord<Value>(array: Value[], key: Key, arrays: true): Record<Key, Value[]>;
/**
 * - Converts an array into a record
 * - Uses `key` to find an identifcation value to use as keys
 */
export declare function toRecord<Value>(array: Value[], key: KeyCallback<Value>): Record<Key, Value>;
/**
 * - Converts an array into a record
 * - Uses `key` to find an identifcation value to use as keys
 * - Groups values into arrays
 */
export declare function toRecord<Value>(array: Value[], key: KeyCallback<Value>, arrays: true): Record<Key, Value[]>;
