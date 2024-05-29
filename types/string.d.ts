/**
 * Capitalise the first letter of a string _(and lowercase the rest)_
 */
export declare function capitalise(value: string): string;
/**
 * Create a new UUID
 */
export declare function createUuid(): string;
/**
 * Get the string value from any value
 */
export declare function getString(value: unknown): string;
/**
 * Convert a string to title case _(capitalising every word)_
 */
export declare function titleCase(value: string): string;
/**
 * Truncates a string to a specified length, when possible
 * - Returned as-is if the string is already short enough
 * - A suffix may be appended to the truncated string, e.g., an ellipsis
 */
export declare function truncate(value: string, length: number, suffix?: string): string;
export declare function words(value: string): string[];
export { capitalise as capitalize };
