import {insertValues} from './insert';

/**
 * Returns a new compacted array with all `null` and `undefined` values removed
 */
export function compact<Value>(
	array: Array<Value | null | undefined>,
): Value[] {
	return array.filter(value => value != null);
}

/**
 * - Pushes values to the end of an array
 * - Uses chunking to avoid stack overflow
 */
export function push<Value>(array: Value[], values: Value[]): number {
	return insertValues('push', array, values, array.length, 0) as number;
}

export * from './chunk';
export * from './exists';
export * from './filter';
export * from './find';
export {groupBy} from './group-by';
export * from './index-of';
export {insert} from './insert';
export {sort} from './sort';
export * from './splice';
export * from './to-map';
export * from './to-record';
export * from './unique';
