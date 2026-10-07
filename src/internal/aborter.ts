import {ABORTER_EVENT, ABORTER_OPTIONS, type Aborter} from '../models/aborter.model';

// #region Functions

export function createAborter(value: unknown, onAbort: () => void): Aborter | undefined {
	if (!(value instanceof AbortSignal)) {
		return;
	}

	value.addEventListener(ABORTER_EVENT, onAbort, ABORTER_OPTIONS);

	return {
		callback: onAbort,
		signal: value,
		cancel: () => value.removeEventListener(ABORTER_EVENT, onAbort),
	};
}

// #endregion
