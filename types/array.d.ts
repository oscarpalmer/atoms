import type { Key } from './value';
type BooleanCallback<T> = (item: T, index: number, array: T[]) => boolean;
type KeyCallback<T> = (item: T) => Key;
/**
 * Chunks an array into smaller arrays of a specified size
 */
export declare function chunk<T>(array: T[], size?: number): T[][];
/**
 * Does the value exist in array?
 */
export declare function exists<T1, T2>(array: T1[], value: T2 | BooleanCallback<T1>): boolean;
/**
 * - Does the value exist in array?
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function exists<T1, T2 = T1>(array: T1[], value: T2, key: Key | KeyCallback<T1>): boolean;
/**
 * Returns a filtered array of items matching `value`
 */
export declare function filter<T1, T2>(array: T1[], value: T2 | BooleanCallback<T1>): T1[];
/**
 * - Returns a filtered array of items
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function filter<T1, T2 = T1>(array: T1[], value: T2, key: Key | KeyCallback<T1>): T1[];
/**
 * Returns the first item matching `value`, or `undefined` if no match is found
 */
export declare function find<T1, T2>(array: T1[], value: T2 | BooleanCallback<T1>): T1 | undefined;
/**
 * - Returns the first matching item, or `undefined` if no match is found
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function find<T1, T2 = T1>(array: T1[], value: T2, key: Key | KeyCallback<T1>): T1 | undefined;
/**
 * Groups an array of items using a key or callback
 */
export declare function groupBy<T>(array: T[], key: Key | KeyCallback<T>): Record<Key, T[]>;
/**
 * Returns the index for the first item matching `value`, or `-1` if no match is found
 */
export declare function indexOf<T1, T2>(array: T1[], value: T2 | BooleanCallback<T1>): number;
/**
 * - Returns the index for the first matching item, or `-1` if no match is found
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function indexOf<T1, T2 = T1>(array: T1[], value: T2, key: Key | KeyCallback<T1>): number;
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
 * Returns an array of unique items
 */
export declare function unique<T>(array: T[]): T[];
/**
 * - Returns an array of unique items
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function unique<T>(array: T[], key: Key | KeyCallback<T>): T[];
export {};
