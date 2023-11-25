/**
 * Create a new UUID
 */
export declare function createUuid(): string;
/**
 * Get the string value from any value
 */
export declare function getString(value: unknown): string;
/**
 * Is the value undefined, null, or an empty string?
 */
export declare function isNullableOrWhitespace(value: unknown): value is undefined | null | '';
