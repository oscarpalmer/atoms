/**
 * Are two strings equal? _(Case-sensitive by default)_
 */
export declare function equal(first: string, second: string, ignoreCase?: boolean): boolean;
/**
 * Are two values equal? _(Does a deep comparison, if needed)_
 */
export declare function equal(first: unknown, second: unknown): boolean;
