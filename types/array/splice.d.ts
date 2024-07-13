/**
 * Removes and returns all items from an array starting from a specific index
 */
export declare function splice<Value>(array: Value[], start: number): Value[];
/**
 * Removes and returns _(up to)_ a specific amount of items from an array, starting from a specific index
 */
export declare function splice<Value>(array: Value[], start: number, amount: number): Value[];
/**
 * - Splices values into an array and returns any removed values
 * - Uses chunking to avoid stack overflow
 */
export declare function splice<Value>(array: Value[], start: number, values: Value[]): Value[];
/**
 * - Splices values into an array and returns any removed values
 * - Uses chunking to avoid stack overflow
 */
export declare function splice<Value>(array: Value[], start: number, amount: number, values: Value[]): Value[];
