import {COMPARE_SETS_DIFFERENCE, compareSets} from '../internal/array/sets';
import type {PlainObject} from '../models';

/**
 * Get the items from the first array that are not in the second array
 * @param first First array
 * @param second Second array
 * @param callback Callback to get an item's value for comparison
 * @returns Unique values from the first array
 */
export function difference<First, Second>(
	first: First[],
	second: Second[],
	callback: (item: First | Second) => unknown,
): First[];

/**
 * Get the items from the first array that are not in the second array
 * @param first First array
 * @param second Second array
 * @param key Key to get an item's value for comparison
 * @returns Unique values from the first array
 */
export function difference<
	First extends PlainObject,
	Second extends PlainObject,
	SharedKey extends keyof First & keyof Second,
>(first: First[], second: Second[], key: SharedKey): First[];

/**
 * Get the items from the first array that are not in the second array
 * @param first First array
 * @param second Second array
 * @returns Unique values from the first array
 */
export function difference<First, Second>(first: First[], second: Second[]): First[];

export function difference(first: unknown[], second: unknown[], key?: unknown): unknown[] {
	return compareSets(COMPARE_SETS_DIFFERENCE, first, second, key);
}
