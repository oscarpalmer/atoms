import type {PromiseStrategy} from './models';

// #region Variables

export const PROMISE_ABORT_EVENT = 'abort';

export const PROMISE_ABORT_OPTIONS = {once: true};

export const PROMISE_ERROR_NAME = 'PromiseTimeoutError';

export const PROMISE_MESSAGE_EXPECTATION_ATTEMPT = 'Attempt expected a function or a promise';

export const PROMISE_MESSAGE_EXPECTATION_ITEMS_EMPTY =
	'promises expected at least one promise-function or promise in the array or object';

export const PROMISE_MESSAGE_EXPECTATION_ITEMS_TYPE =
	'promises expected an array or object holding promise-functions or promises';

export const PROMISE_MESSAGE_EXPECTATION_RESULT = 'toResult expected a Promise';

export const PROMISE_MESSAGE_EXPECTATION_TIMED = 'Timed function expected a Promise';

export const PROMISE_MESSAGE_TIMEOUT = 'Promise timed out';

export const PROMISE_STRATEGY_ALL = new Set<PromiseStrategy>(['complete', 'first']);

export const PROMISE_STRATEGY_DEFAULT: PromiseStrategy = 'complete';

export const PROMISE_TYPE_FULFILLED = 'fulfilled';

export const PROMISE_TYPE_REJECTED = 'rejected';

// #endregion
