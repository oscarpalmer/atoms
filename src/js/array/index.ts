import type {NestedArrayType} from '../models';
import {insertValues} from './insert';

/**
 * Flattens an array _(using native `flat` and maximum depth)_
 */
export function flatten<Value>(array: Value[]): NestedArrayType<Value>[] {
	return array.flat(Number.POSITIVE_INFINITY) as NestedArrayType<Value>[];
}

/**
 * - Pushes values to the end of an array, returning the new length
 * - Uses chunking to avoid stack overflow
 */
export function push<Value>(array: Value[], values: Value[]): number {
	return insertValues('push', array, values, array.length, 0) as number;
}

export * from './chunk';
export * from './compact';
export * from './count';
export * from './exists';
export * from './filter';
export * from './find';
export {groupBy} from './group-by';
export * from './index-of';
export {insert} from './insert';
export * from './shuffle';
export {sort} from './sort';
export * from './splice';
export * from './to-map';
export * from './to-record';
export * from './unique';
