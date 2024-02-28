export type ArrayOrObject = unknown[] | GenericObject;
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
export type GenericObject = Record<string, unknown>;
export type Key = number | string;
export type ValueObject = ArrayOrObject | Map<unknown, unknown>;
/**
 * Clones any kind of value
 */
export declare function clone<T>(value: T): T;
export declare function diff<T1 = unknown, T2 = T1>(first: T1, second: T2): DiffResult<T1, T2>;
/**
 * - Get the value from an object using a key path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - Returns `undefined` if the value is not found
 */
export declare function get(data: ValueObject, key: Key): unknown;
/**
 * Is the value an array or a generic object?
 */
export declare function isArrayOrObject(value: unknown): value is ArrayOrObject;
/**
 * Is the value undefined or null?
 */
export declare function isNullable(value: unknown): value is undefined | null;
/**
 * Is the value a generic object?
 */
export declare function isObject(value: unknown): value is GenericObject;
/**
 * Merges multiple arrays or objects into a single one
 */
export declare function merge<T = ArrayOrObject>(...values: T[]): T;
/**
 * - Set the value in an object using a key path
 * - You can set a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If a part of the path does not exist, it will be created, either as an array or a generic object, depending on the key
 * - Returns the original object
 */
export declare function set<T extends ValueObject>(data: T, key: Key, value: unknown): T;
