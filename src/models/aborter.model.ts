import type {GenericCallback} from './index';

// #region Types

export type Aborter = {
	callback: GenericCallback;
	cancel(): void;
	signal: AbortSignal;
};

// #endregion

// #region Variables

export const ABORTER_EVENT = 'abort';

export const ABORTER_OPTIONS = {once: true};

// #endregion
