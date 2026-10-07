import type {ArrayOverlapItem, ArrayOverlapResult} from '../../models/array/array.misc.model';

// #region Functions

export function arraysOverlap(
	first: ArrayOverlapItem,
	second: ArrayOverlapItem,
): ArrayOverlapResult {
	const firstArray = first.index < second.index ? first.array : second.array;
	const secondArray = first.index < second.index ? second.array : first.array;

	const firstIndex = firstArray === first.array ? first.index : second.index;
	const secondIndex = firstArray === first.array ? second.index : first.index;

	const firstEnd = firstIndex + firstArray.length - 1;
	const secondEnd = secondIndex + secondArray.length - 1;

	const overlap = firstIndex <= secondEnd && firstEnd >= secondIndex;

	return {
		overlap,
		first: {
			array: firstArray,
			index: firstIndex,
		},
		second: {
			array: secondArray,
			index: secondIndex,
		},
	};
}

// #endregion
