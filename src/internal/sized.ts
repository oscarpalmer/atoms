// #region Functions

import {clamp} from './number';

export function getSizedMaximum(first?: unknown, second?: unknown): number {
	let actual: number;

	if (typeof first === 'number') {
		actual = first;
	} else {
		actual = typeof second === 'number' ? second : MAXIMUM_DEFAULT;
	}

	return clamp(actual, 1, MAXIMUM_ABSOLUTE);
}

// #endregion

// #region Variables

const MAXIMUM_ABSOLUTE = 16_777_216; // 2^24

const MAXIMUM_DEFAULT = 1_048_576; // 2^20

// #endregion
