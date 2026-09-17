import type {GenericCallback} from '../models';

// #region Types

export type Aborter = {
	callback: GenericCallback;
	signal: AbortSignal;
	cancel: () => void;
};

// #endregion

// #region Functions

export function createAborter(value: unknown, onAbort: () => void): Aborter | undefined {
	if (!(value instanceof AbortSignal)) {
		return;
	}

	value.addEventListener(ABORT_EVENT, onAbort, ABORT_OPTIONS);

	return {
		callback: onAbort,
		signal: value,
		cancel: () => value.removeEventListener(ABORT_EVENT, onAbort),
	};
}

// #endregion

// #region Variables

const ABORT_EVENT = 'abort';

const ABORT_OPTIONS = {once: true};

// #endregion
