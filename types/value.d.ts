import type { ToString } from 'type-fest/source/internal';
import type { ArrayOrPlainObject, Get, Paths, PlainObject } from './models';
export type DiffType = 'full' | 'none' | 'partial';
export type DiffResult<First, Second = First> = {
    original: DiffValue<First, Second>;
    type: DiffType;
    values: Record<string, DiffValue>;
};
export type DiffValue<First = unknown, Second = First> = {
    from: First;
    to: Second;
};
/**
 * Clones any kind of value
 */
export declare function clone<Value>(value: Value): Value;
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
export declare function diff<First, Second = First>(first: First, second: Second): DiffResult<First, Second>;
/**
 * - Get the value from an object using a known path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - Returns `undefined` if the value is not found
 */
export declare function getValue<Data extends PlainObject, Path extends Paths<Data>>(data: Data, path: Path): Get<Data, ToString<Path>>;
/**
 * - Get the value from an object using an unknown path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If `ignoreCase` is `true`, path matching will be case-insensitive
 * - Returns `undefined` if the value is not found
 */
export declare function getValue<Data extends PlainObject>(data: Data, path: string, ignoreCase?: boolean): unknown;
/**
 * Merges multiple arrays or objects into a single one
 */
export declare function merge<Model extends ArrayOrPlainObject>(...values: Model[]): Model;
/**
 * - Set the value in an object using a known path
 * - You can set a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If a part of the path does not exist, it will be created, either as an array or a generic object, depending on the path
 * - Returns the original object
 */
export declare function setValue<Data extends PlainObject, Path extends Paths<Data>>(data: Data, path: Path, value: unknown): Data;
/**
 * - Set the value in an object using an unknown path
 * - You can set a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If a part of the path does not exist, it will be created, either as an array or a generic object, depending on the path
 * - If `ignoreCase` is `true`, path matching will be case-insensitive
 * - Returns the original object
 */
export declare function setValue<Data extends PlainObject>(data: Data, path: string, value: unknown, ignoreCase?: boolean): Data;
