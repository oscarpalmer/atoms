/**
 * - Get the value from an object using a path
 * - You can retrieve a nested value by using a dot notation path
 */
export declare function getValue(data: unknown, key: unknown): unknown;
/**
 * Is the value undefined or null?
 */
export declare function isNullable(value: unknown): value is undefined | null;
