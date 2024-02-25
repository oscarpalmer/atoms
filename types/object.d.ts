import { ArrayOrObject } from './value';
/**
 * Clones any kind of value
 */
export declare function clone<T>(value: T): T;
/**
 * Merges multiple arrays or objects into a single one
 */
export declare function merge<T = ArrayOrObject>(...values: T[]): T;
