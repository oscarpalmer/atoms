import type {GenericCallback} from '../models';
import type {Result} from '../result/models';

// #region Types

/**
 * A _Promise_ that can be canceled
 */
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
	 * Cancel the _Promise_, rejecting it with an optional reason
	 *
	 * @param reason Optional reason for canceling the _Promise_
	 */
	cancel(reason?: unknown): void {
		this.#rejector(reason);
	}
}

/**
 * A _Promise_ that was fulfilled
 */
export type FulfilledPromise<Value> = {
	/**
	 * Status of the _Promise_
	 */
	status: typeof PROMISE_TYPE_FULFILLED;
	/**
	 * Value of the _Promise_
	 */
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

/**
 * Options for a _Promise_-handling function
 */
export type PromiseOptions = {
	/**
	 * AbortSignal for aborting the _Promise_; when aborted, the _Promise_ will reject with the reason of the signal
	 */
	signal?: AbortSignal;
	/**
	 * How long to wait for _(in milliseconds; defaults to `0`)_
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
 * _Promise_ handling strategy
 *
 * - `complete`: wait for all _Promises_ to settle, then return the results, as an array of fulfilled and/or rejected results
 * - `first`: rejects on the first rejected _Promise_, and returns an array of values
 */
export type PromiseStrategy = 'complete' | 'first';

/**
 * An error thrown when a promise times out
 */
export class PromiseTimeoutError extends Error {
	constructor() {
		super(PROMISE_MESSAGE_TIMEOUT);

		this.name = PROMISE_ERROR_NAME;
	}
}

export type PromisesItems<Items extends unknown[]> = {
	[ItemsKey in keyof Items]: Items[ItemsKey] extends GenericCallback
		? ReturnType<Items[ItemsKey]> extends Promise<infer Value>
			? Promise<Value>
			: never
		: Items[ItemsKey] extends Promise<infer Value>
			? Promise<Value>
			: Promise<Items[ItemsKey]>;
};

/**
 * Options for handling multiple _Promises_
 */
export type PromisesOptions = {
	/**
	 * AbortSignal for aborting the _Promises_; when aborted, the _Promises_ will reject with the reason of the signal
	 */
	signal?: AbortSignal;
	/**
	 * Strategy for handling the _Promises_; defaults to `complete`
	 */
	strategy?: PromiseStrategy;
};

export type PromisesResult<Items extends unknown[]> = {
	[ItemsKey in keyof Items]: Items[ItemsKey] extends Promise<infer Value>
		? Result<Awaited<Value>>
		: never;
};

export type PromisesUnwrapped<Items extends unknown[]> = {
	[ItemsKey in keyof Items]: Items[ItemsKey] extends GenericCallback
		? ReturnType<Items[ItemsKey]> extends Promise<infer Value>
			? Awaited<Value>
			: never
		: Items[ItemsKey] extends Promise<infer Value>
			? Awaited<Value>
			: never;
};

export type PromisesValue<Value> = FulfilledPromise<Value> | RejectedPromise;

export type PromisesValues<Items extends unknown[]> = {
	[ItemsKey in keyof Items]: Items[ItemsKey] extends GenericCallback
		? ReturnType<Items[ItemsKey]> extends Promise<infer Value>
			? PromisesValue<Awaited<Value>>
			: never
		: Items[ItemsKey] extends Promise<infer Value>
			? PromisesValue<Awaited<Value>>
			: never;
};

/**
 * A _Promise_ that was rejected
 */
export type RejectedPromise = {
	/**
	 * Status of the _Promise_
	 */
	status: typeof PROMISE_TYPE_REJECTED;
	/**
	 * Reason for the rejection
	 */
	reason: unknown;
};

// #endregion

// #region Variables

export const PROMISE_ABORT_EVENT = 'abort';

export const PROMISE_ABORT_OPTIONS = {once: true};

export const PROMISE_ERROR_NAME = 'PromiseTimeoutError';

export const PROMISE_MESSAGE_EXPECTATION_ATTEMPT = 'Attempt expected a function or a promise';

export const PROMISE_MESSAGE_EXPECTATION_RESULT = 'toResult expected a Promise';

export const PROMISE_MESSAGE_EXPECTATION_TIMED = 'Timed function expected a Promise';

export const PROMISE_MESSAGE_TIMEOUT = 'Promise timed out';

export const PROMISE_STRATEGY_ALL = new Set<PromiseStrategy>(['complete', 'first']);

export const PROMISE_STRATEGY_DEFAULT: PromiseStrategy = 'complete';

export const PROMISE_TYPE_FULFILLED = 'fulfilled';

export const PROMISE_TYPE_REJECTED = 'rejected';

// #endregion
