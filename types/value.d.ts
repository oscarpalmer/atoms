export type ArrayOrObject = unknown[] | GenericObject;
export type GenericObject = Record<string, unknown>;
export type Key = number | string;
export type ValueObject = ArrayOrObject | Map<unknown, unknown> | Set<unknown>;
/**
 * - Get the value from an object using a key path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - Returns `undefined` if the value is not found
 */
export declare function getValue(data: ValueObject, key: Key): unknown;
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
 * - Set the value in an object using a key path
 * - You can set a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If a part of the path does not exist, it will be created, either as an array or a generic object, depending on the key
 * - Returns the original object
 */
export declare function setValue<Model extends ValueObject>(data: Model, key: Key, value: unknown): Model;
