import {insertValues} from '../internal/array/insert';

/**
 * - Push values to the end of an array
 * - Returns the new length
 * - _(Uses chunking to avoid call stack size being exceeded)_
 */
export function push<Item>(array: Item[], pushed: Item[]): number {
	return insertValues('push', array, pushed, array.length, 0) as number;
}
