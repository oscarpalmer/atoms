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
 * - Find the differences between two values
 * - Returns an object holding the result:
 * 	- `original` holds the original values
 * 	- `type` is the type of difference:
 * 		- `full` if the values are completely different
 * 		- `none` if the values are the same
 * 		- `partial` if the values are partially different
 * 	- `values` holds the differences with dot notation keys
 */
export declare function diff<First, Second = First>(first: First, second: Second): DiffResult<First, Second>;
