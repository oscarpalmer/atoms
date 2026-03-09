import type {Result} from '../result/models';

// #region Types

export class CancelablePromise<Value = void> extends Promise<Value> {
	#rejector!: (reason: unknown) => void;

	constructor(
		executor: (resolve: (value: Value) => void, reject: (reason: unknown) => void) => void,
	) {
		let rejector: (reason: unknown) => void;

		super((resolve, reject) => {
			rejector = reject;

			executor(resolve, reject);
		});

		this.#rejector = rejector!;
	}

	/**
	 * Cancel the promise, rejecting it with an optional reason
	 * @param reason Optional reason for canceling the promise
	 */
	cancel(reason?: unknown): void {
		this.#rejector(reason);
	}
}

export type FulfilledPromise<Value> = {
	status: typeof PROMISE_TYPE_FULFILLED;
	value: Awaited<Value>;
};

export type PromiseData = {
	last: number;
	result: unknown[];
};

export type PromiseHandlers = {
	resolve: (value: unknown[]) => void;
	reject: (reason: unknown) => void;
};

export type PromiseOptions = {
	/**
	 * AbortSignal for aborting the promise; when aborted, the promise will reject with the reason of the signal
	 */
	signal?: AbortSignal;
	/**
	 * How long to wait for (in milliseconds; defaults to `0`)
	 */
	time?: number;
};

export type PromiseParameters = {
	abort: () => void;
	complete: boolean;
	data: PromiseData;
	handlers: PromiseHandlers;
	index: number;
	signal?: AbortSignal;
	value?: unknown;
};

/**
 * Promise handling strategy
 *
 * - `complete`: wait for all promises to settle, then return the results
 * 	- Returns an array of fulfilled and/or rejected results
 * - `first`: rejects on the first rejected promise
 * 	- Returns an array of values
 */
export type PromiseStrategy = 'complete' | 'first';

export class PromiseTimeoutError extends Error {
	constructor() {
		super(PROMISE_MESSAGE_TIMEOUT);

		this.name = PROMISE_ERROR_NAME;
	}
}

export type PromisesItems<Items extends unknown[]> = {
	[K in keyof Items]: Promise<Items[K]>;
};

export type PromisesOptions = {
	signal?: AbortSignal;
	strategy?: PromiseStrategy;
};

export type PromisesResult<Items extends unknown[]> = {
	[K in keyof Items]: Items[K] extends Promise<infer Value> ? Result<Awaited<Value>> : never;
};

export type PromisesValue<Value> = FulfilledPromise<Value> | RejectedPromise;

export type PromisesValues<Items extends unknown[]> = {
	[K in keyof Items]: Items[K] extends Promise<infer Value> ? PromisesValue<Awaited<Value>> : never;
};

export type RejectedPromise = {
	status: typeof PROMISE_TYPE_REJECTED;
	reason: unknown;
};

// #endregion

// #region Variables

export const PROMISE_ABORT_EVENT = 'abort';

export const PROMISE_ABORT_OPTIONS = {once: true};

export const PROMISE_ERROR_NAME = 'PromiseTimeoutError';

export const PROMISE_MESSAGE_EXPECTATION_ATTEMPT = 'Attempt expected a function or a promise';

export const PROMISE_MESSAGE_EXPECTATION_PROMISES = 'Promises expected an array of promises';

export const PROMISE_MESSAGE_EXPECTATION_RESULT = 'toResult expected a Promise';

export const PROMISE_MESSAGE_EXPECTATION_TIMED = 'Timed function expected a Promise';

export const PROMISE_MESSAGE_TIMEOUT = 'Promise timed out';

export const PROMISE_STRATEGY_ALL = new Set<PromiseStrategy>(['complete', 'first']);

export const PROMISE_STRATEGY_DEFAULT: PromiseStrategy = 'complete';

export const PROMISE_TYPE_FULFILLED = 'fulfilled';

export const PROMISE_TYPE_REJECTED = 'rejected';

// #endregion
