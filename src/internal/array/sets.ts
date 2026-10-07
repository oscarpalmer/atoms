import {
	ARRAY_SETS_COMPARE_DIFFERENCE,
	ARRAY_SETS_COMPARE_INTERSECTION,
	ARRAY_SETS_COMPARE_UNION,
	type ArrayCompareSetsType,
} from '../../models/array/array.misc.model';
import {getArrayCallback} from './callbacks';

// #region Functions

export function compareSets(
	type: ArrayCompareSetsType,
	first: unknown[],
	second: unknown[],
	key?: unknown,
): unknown[] {
	if (!Array.isArray(first)) {
		return [];
	}

	const isDifference = type === ARRAY_SETS_COMPARE_DIFFERENCE;
	const isIntersection = type === ARRAY_SETS_COMPARE_INTERSECTION;
	const isUnion = type === ARRAY_SETS_COMPARE_UNION;

	if (first.length === 0) {
		return isDifference ? first.slice() : isIntersection ? [] : second.slice();
	}

	if (!Array.isArray(second) || second.length === 0) {
		return isIntersection ? [] : first.slice();
	}

	const callback = getArrayCallback(key);

	const values = isUnion ? first : second;
	let {length} = values;

	const set = new Set<unknown>([]);

	for (let index = 0; index < length; index += 1) {
		const item = values[index];

		set.add(callback?.(item, index, values) ?? item);
	}

	const source = isUnion ? second : first;

	length = source.length;

	const result: unknown[] = isUnion ? first.slice() : [];

	for (let index = 0; index < length; index += 1) {
		const item = source[index];
		const value = callback?.(item, index, source) ?? item;

		if (isIntersection ? set.has(value) : !set.has(value)) {
			result.push(item);
		}
	}

	return result;
}

// #endregion
