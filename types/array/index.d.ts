import type { NestedArrayType } from '../models';
/**
 * Flattens an array _(using native `flat` and maximum depth)_
 */
export declare function flatten<Value>(array: Value[]): NestedArrayType<Value>[];
/**
 * - Pushes values to the end of an array, returning the new length
 * - Uses chunking to avoid stack overflow
 */
export declare function push<Value>(array: Value[], values: Value[]): number;
export * from './chunk';
export * from './compact';
export * from './count';
export * from './exists';
export * from './filter';
export * from './find';
export { groupBy } from './group-by';
export * from './index-of';
export { insert } from './insert';
export * from './shuffle';
export { sort } from './sort';
export * from './splice';
export * from './to-map';
export * from './to-record';
export * from './unique';
