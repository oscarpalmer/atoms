import type {ArrayComparison} from './array.misc.model';

// #region Variables

export const ARRAY_MATCH_COMPARISON_END: ArrayComparison = 'end';

export const ARRAY_MATCH_COMPARISON_INSIDE: ArrayComparison = 'inside';

export const ARRAY_MATCH_COMPARISON_INVALID: ArrayComparison = 'invalid';

export const ARRAY_MATCH_COMPARISON_OUTSIDE: ArrayComparison = 'outside';

export const ARRAY_MATCH_COMPARISON_SAME: ArrayComparison = 'same';

export const ARRAY_MATCH_COMPARISON_START: ArrayComparison = 'start';

export const arrayMatchEndings: Set<ArrayComparison> = new Set([
	ARRAY_MATCH_COMPARISON_END,
	ARRAY_MATCH_COMPARISON_SAME,
]);

export const arrayMatchInvalid: readonly [-1, ArrayComparison] = [
	-1,
	ARRAY_MATCH_COMPARISON_INVALID,
];

export const arrayMatchOutside: readonly [-1, ArrayComparison] = [
	-1,
	ARRAY_MATCH_COMPARISON_OUTSIDE,
];

export const arrayMatchOutsides: Set<ArrayComparison> = new Set([
	ARRAY_MATCH_COMPARISON_INVALID,
	ARRAY_MATCH_COMPARISON_OUTSIDE,
]);

export const arrayMatchStarts: Set<ArrayComparison> = new Set([
	ARRAY_MATCH_COMPARISON_START,
	ARRAY_MATCH_COMPARISON_SAME,
]);

// #endregion
