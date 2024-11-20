import {insertValues} from '../array/insert';
import type {NestedArrayType} from '../models';

/**
 * Flatten an array _(using native `flat` and maximum depth)_
 */
export function flatten<Item>(array: Item[]): NestedArrayType<Item>[] {
	return array.flat(Number.POSITIVE_INFINITY) as NestedArrayType<Item>[];
}

/**
 * - Push values to the end of an array
 * - Returns the new length
 * - _(Uses chunking to avoid stack overflow)_
 */
export function push<Item>(array: Item[], pushed: Item[]): number {
	return insertValues('push', array, pushed, array.length, 0) as number;
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

