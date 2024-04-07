import type { Key } from './models';
type BooleanCallback<Value> = (value: Value, index: number, array: Value[]) => boolean;
type KeyCallback<Value> = (value: Value) => Key;
/**
 * Chunks an array into smaller arrays of a specified size
 */
export declare function chunk<Value>(array: Value[], size?: number): Value[][];
/**
 * Does the value exist in array?
 */
export declare function exists<Model, Value>(array: Model[], value: Value | BooleanCallback<Model>): boolean;
/**
 * - Does the value exist in array?
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function exists<Model, Value = Model>(array: Model[], value: Value, key: Key | KeyCallback<Model>): boolean;
/**
 * Returns a filtered array of items matching `value`
 */
export declare function filter<Model, Value>(array: Model[], value: Value | BooleanCallback<Model>): Model[];
/**
 * - Returns a filtered array of items
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function filter<Model, Value = Model>(array: Model[], value: Value, key: Key | KeyCallback<Model>): Model[];
/**
 * Returns the first item matching `value`, or `undefined` if no match is found
 */
export declare function find<Model, Value>(array: Model[], value: Value | BooleanCallback<Model>): Model | undefined;
/**
 * - Returns the first matching item, or `undefined` if no match is found
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function find<Model, Value = Model>(array: Model[], value: Value, key: Key | KeyCallback<Model>): Model | undefined;
/**
 * Groups an array of items using a key or callback
 */
export declare function groupBy<Value>(array: Value[], key: Key | KeyCallback<Value>): Record<Key, Value[]>;
/**
 * Returns the index for the first item matching `value`, or `-1` if no match is found
 */
export declare function indexOf<Model, Value>(array: Model[], value: Value | BooleanCallback<Model>): number;
/**
 * - Returns the index for the first matching item, or `-1` if no match is found
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function indexOf<Model, Value = Model>(array: Model[], value: Value, key: Key | KeyCallback<Model>): number;
/**
 * - Inserts values into an array at a specified index
 * - Uses chunking to avoid stack overflow
 */
export declare function insert<Value>(array: Value[], index: number, values: Value[]): void;
/**
 * - Pushes values to the end of an array
 * - Uses chunking to avoid stack overflow
 */
export declare function push<Value>(array: Value[], values: Value[]): number;
/**
 * Removes and returns all items from an array starting from a specific index
 */
export declare function splice<Value>(array: Value[], start: number): Value[];
/**
 * Removes and returns _(up to)_ a specific amount of items from an array, starting from a specific index
 */
export declare function splice<Value>(array: Value[], start: number, amount: number): Value[];
/**
 * - Splices values into an array and returns any removed values
 * - Uses chunking to avoid stack overflow
 */
export declare function splice<Value>(array: Value[], start: number, values: Value[]): Value[];
/**
 * - Splices values into an array and returns any removed values
 * - Uses chunking to avoid stack overflow
 */
export declare function splice<Value>(array: Value[], start: number, amount: number, values: Value[]): Value[];
/**
 * Returns an array of unique items
 */
export declare function unique<Value>(array: Value[]): Value[];
/**
 * - Returns an array of unique items
 * - Use `key` to find a comparison value to match with `value`
 */
export declare function unique<Value>(array: Value[], key: Key | KeyCallback<Value>): Value[];
export {};
