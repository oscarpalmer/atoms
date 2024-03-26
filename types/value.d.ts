import type { ArrayOrPlainObject } from './models';
export type DiffType = 'full' | 'none' | 'partial';
export type DiffResult<T1 = unknown, T2 = T1> = {
    original: DiffValue<T1, T2>;
    type: DiffType;
    values: Record<string, DiffValue>;
};
export type DiffValue<T1 = unknown, T2 = T1> = {
    from: T1;
    to: T2;
};
export type Key = number | string;
export type ValueObject = ArrayOrPlainObject | Map<unknown, unknown>;
/**
 * Clones any kind of value
 */
export declare function clone<T>(value: T): T;
/**
 * - Find the differences between two values
 * - Returns an object holding the result:
 * 	- `original` holds the original values
 * 	- `type` is the type of difference:
 * 		- `full` if the values are completely different
 * 		- `none` if the values are the same
 * 		- `partial` if the values are partially different
 * 	- `values` holds the differences with dot-notation keys
 */
export declare function diff<T1 = unknown, T2 = T1>(first: T1, second: T2): DiffResult<T1, T2>;
/**
 * - Get the value from an object using a key path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - Returns `undefined` if the value is not found
 */
export declare function getValue(data: ValueObject, key: Key): unknown;
/**
 * Merges multiple arrays or objects into a single one
 */
export declare function merge<T extends ArrayOrPlainObject>(...values: T[]): T;
/**
 * - Set the value in an object using a key path
 * - You can set a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If a part of the path does not exist, it will be created, either as an array or a generic object, depending on the key
 * - Returns the original object
 */
export declare function setValue<T extends ValueObject>(data: T, key: Key, value: unknown): T;
