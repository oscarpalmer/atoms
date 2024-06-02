/**
 * Convert a string to camel case _(thisIsCamelCase)_
 */
export declare function camelCase(value: string): string;
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
 * Joins an array into a string while ignoring empty values _(with an optional delimiter)_
 */
export declare function join(value: unknown[], delimiter?: string): string;
/**
 * Convert a string to kebab case _(this-is-kebab-case)_
 */
export declare function kebabCase(value: string): string;
/**
 * Convert a string to pascal case _(ThisIsPascalCase)_
 */
export declare function pascalCase(value: string): string;
/**
 * Convert a string to snake case _(this_is_snake_case)_
 */
export declare function snakeCase(value: string): string;
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
