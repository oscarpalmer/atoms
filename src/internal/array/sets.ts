import {getArrayCallback} from './callbacks';

// #region Types

type CompareSetsType = 'difference' | 'intersection' | 'union';

// #endregion

// #region Functions

export function compareSets(
	type: CompareSetsType,
	first: unknown[],
	second: unknown[],
	key?: unknown,
): unknown[] {
	if (!Array.isArray(first)) {
		return [];
	}

	const isDifference = type === COMPARE_SETS_DIFFERENCE;
	const isIntersection = type === COMPARE_SETS_INTERSECTION;
	const isUnion = type === COMPARE_SETS_UNION;

	if (first.length === 0) {
		return isDifference ? [...first] : isIntersection ? [] : [...second];
	}

	if (!Array.isArray(second) || second.length === 0) {
		return isIntersection ? [] : [...first];
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

	const result: unknown[] = isUnion ? [...first] : [];

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

// #region Variables

export const COMPARE_SETS_DIFFERENCE: CompareSetsType = 'difference';

export const COMPARE_SETS_INTERSECTION: CompareSetsType = 'intersection';

export const COMPARE_SETS_UNION: CompareSetsType = 'union';

// #endregion
