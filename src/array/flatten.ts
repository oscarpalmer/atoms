import type {NestedArrayType} from '../models';

/**
 * Flatten an array _(using native `flat` and maximum depth)_
 */
export function flatten<Item>(array: Item[]): NestedArrayType<Item>[] {
	return (
		Array.isArray(array) ? array.flat(Number.POSITIVE_INFINITY) : []
	) as NestedArrayType<Item>[];
}
