/**
 * Create a new UUID
 */
export declare function createUuid(): string;
/**
 * Get the string value from any value
 */
export declare function getString(value: unknown): string;
/**
 * Joins an array into a string while ignoring empty values _(with an optional delimiter)_
 */
export declare function join(value: unknown[], delimiter?: string): string;
/**
 * Parses a JSON string into its proper value _(or `undefined` if it fails)_
 */
export declare function parse(value: string, reviver?: (this: unknown, key: string, value: unknown) => unknown): unknown;
/**
 * Truncates a string to a specified length, when possible
 * - Returned as-is if the string is already short enough
 * - A suffix may be appended to the truncated string, e.g., an ellipsis
 */
export declare function truncate(value: string, length: number, suffix?: string): string;
/**
 * Split a string into words _(and other readable parts)_
 */
export declare function words(value: string): string[];
export * from './case';
export * from './template';
