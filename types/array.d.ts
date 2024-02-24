import { Key } from './value';
type KeyCallback<T> = (item: T) => Key;
/**
 * Chunks an array into smaller arrays of a specified size
 */
export declare function chunk<T>(array: T[], size?: number): T[][];
/**
 * Does the value exist in the array?
 * - `key` is optional and can be used to specify a key or callback for finding a key for comparisons
 * - If `key` is not provided, the item itself is used for comparisons
 */
export declare function exists<T1, T2 = T1>(array: T1[], value: T2, key?: Key | KeyCallback<T1>): boolean;
/**
 * Groups an array of items using a key or callback
 */
export declare function groupBy<T>(array: T[], key: Key | ((item: T) => Key)): Record<Key, T[]>;
/**
 * - Inserts values into an array at a specified index
 * - Uses chunking to avoid stack overflow
 */
export declare function insert<T>(array: T[], index: number, values: T[]): void;
/**
 * - Pushes values to the end of an array
 * - Uses chunking to avoid stack overflow
 */
export declare function push<T>(array: T[], values: T[]): number;
/**
 * - Splices values into an array and returns any removed values
 * - Uses chunking to avoid stack overflow
 */
export declare function splice<T>(array: T[], start: number, deleteCount: number, values: T[]): T[];
/**
 * - Returns a new array with unique items
 * - `key` is optional and can be used to specify a key or callback for finding a key for uniqueness
 * - If `key` is not provided, the item itself is used for comparisons
 * - Inspired by Lodash :-)
 */
export declare function unique<T>(array: T[], key?: Key | ((item: T) => Key)): T[];
export {};
