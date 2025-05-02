import type {NestedArrayType} from '../models';

/**
 * Flatten an array _(using native `flat` and maximum depth)_
 */
export function flatten<Item>(array: Item[]): NestedArrayType<Item>[] {
	if (!Array.isArray(array)) {
		return [];
	}

	return array.flat(Number.POSITIVE_INFINITY) as NestedArrayType<Item>[];
}
