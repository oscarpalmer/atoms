import {clamp} from '../number';

// #region Functions

export function getSizedMaximum(first?: unknown, second?: unknown): number {
	let actual: number;

	if (typeof first === 'number') {
		actual = first;
	} else {
		actual = typeof second === 'number' ? second : SIZED_MAXIMUM_DEFAULT;
	}

	return clamp(actual, 1, SIZED_MAXIMUM_ABSOLUTE);
}

// #endregion

// #region Variables

const SIZED_MAXIMUM_ABSOLUTE = 16_777_216; // 2^24

const SIZED_MAXIMUM_DEFAULT = 1_048_576; // 2^20

// #endregion
