import {isError, isOk} from '../result/misc';

// #region Functions

/**
 * A function that does nothing, which can be useful, I guess…
 */
export function noop(): void {}

export function unwrapWork(value: unknown): unknown {
	if (isError(value)) {
		throw value.error;
	}

	return isOk(value) ? value.value : value;
}

// #endregion
