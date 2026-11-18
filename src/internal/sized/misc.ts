import {SIZED_MAXIMUM_ABSOLUTE, SIZED_MAXIMUM_DEFAULT} from '../../models/sized.model';
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
