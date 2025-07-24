import {insertValues} from '../internal/array/insert';

// Uses chunking to avoid call stack size being exceeded

/**
 * Push values into the end of the array
 * @param array Array to push values into
 * @param pushed Values to push into the array
 * @returns New length of the array after pushing the values
 */
export function push<Item>(array: Item[], pushed: Item[]): number {
	return insertValues('push', array, pushed, array.length, 0) as number;
}
