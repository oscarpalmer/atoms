import {ABORTER_EVENT, ABORTER_OPTIONS, type Aborter} from '../models/aborter.model';
import {isInstanceOfConstructor} from './is';

// #region Functions

export function createAborter(value: unknown, onAbort: () => void): Aborter | undefined {
	if (!isInstanceOfConstructor(AbortSignal, value)) {
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
