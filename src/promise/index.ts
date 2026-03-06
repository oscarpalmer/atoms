import type {Result} from '../result/models';
import {getPromiseOptions, getPromisesOptions, getResultsFromPromises} from './helpers';
import {handleResult, settlePromise} from './misc';
import {
	PROMISE_ABORT_OPTIONS,
	PROMISE_EVENT_NAME,
	PROMISE_MESSAGE_EXPECTATION_ATTEMPT,
	PROMISE_MESSAGE_EXPECTATION_PROMISES,
	PROMISE_STRATEGY_DEFAULT,
	PROMISE_TYPE_FULFILLED,
	PROMISE_TYPE_REJECTED,
	type PromiseData,
	type PromiseHandlers,
	type PromiseOptions,
	type PromisesItems,
	type PromisesOptions,
	type PromisesResult,
	type PromisesValue,
	type PromisesValues,
} from './models';
import {getTimedPromise} from './timed';

// #region Functions

/**
 * Wrap a promise with safety handlers, with optional abort capabilities and timeout
 * @param promise Promise to wrap
 * @param options Options for the promise
 * @returns Wrapped promise
 */
export async function attemptPromise<Value>(
	promise: Promise<Value>,
	options?: PromiseOptions | AbortSignal | number,
): Promise<Value>;

/**
 * Wrap a promise-returning callback with safety handlers, with optional abort capabilities and timeout
 * @param callback Callback to wrap
 * @param options Options for the promise
 * @returns Promise-wrapped callback
 */
export async function attemptPromise<Value>(
	callback: () => Promise<Value>,
	options?: PromiseOptions | AbortSignal | number,
): Promise<Value>;

/**
 * Wrap a callback with a promise and safety handlers, with optional abort capabilities and timeout
 * @param callback Callback to wrap
 * @param options Options for the promise
 * @returns Promise-wrapped callback
 */
export async function attemptPromise<Value>(
	callback: () => Value,
	options?: PromiseOptions | AbortSignal | number,
): Promise<Value>;

export async function attemptPromise<Value>(
	value: (() => Value) | Promise<Value>,
	options?: PromiseOptions | AbortSignal | number,
): Promise<Value> {
	const isFunction = typeof value === 'function';

	if (!isFunction && !(value instanceof Promise)) {
		return Promise.reject(new TypeError(PROMISE_MESSAGE_EXPECTATION_ATTEMPT));
	}

	const {signal, time} = getPromiseOptions(options);

	if (signal?.aborted ?? false) {
		return Promise.reject(signal!.reason);
	}

	function abort(): void {
		rejector(signal!.reason);
	}

	async function handler(
		resolve: (value: Value) => void,
		reject: (reason: unknown) => void,
	): Promise<void> {
		try {
			let result = isFunction ? value() : await value;

			if (result instanceof Promise) {
				result = await result;
			}

			settlePromise(abort, resolve, result, signal);
		} catch (error) {
			settlePromise(abort, reject, error, signal);
		}
	}

	let rejector: (reason: unknown) => void;

	signal?.addEventListener(PROMISE_EVENT_NAME, abort, PROMISE_ABORT_OPTIONS);

	const promise = new Promise<Value>((resolve, reject) => {
		rejector = reject;

		handler(resolve, reject);
	});

	return time > 0 ? getTimedPromise(promise, time, signal) : promise;
}

/**
 * Handle a list of promises, returning their results in an ordered array.
 *
 * Depending on the strategy, the function will either reject on the first error encountered or return an array of rejected and resolved results
 * @param items List of promises
 * @param options Options for handling the promises
 * @returns List of results
 */
export async function promises<Items extends unknown[], Options extends PromisesOptions>(
	items: [...Items],
	options?: Options,
): Promise<Options['strategy'] extends 'first' ? Items : PromisesValues<PromisesItems<Items>>>;

/**
 * Handle a list of promises, returning their results in an ordered array.
 *
 * Depending on the strategy, the function will either reject on the first error encountered or return an array of rejected and resolved results
 * @param items List of promises
 * @param options Options for handling the promises
 * @returns List of results
 */
export async function promises<Value, Options extends PromisesOptions>(
	items: Promise<Value>[],
	options?: Options,
): Promise<Options['strategy'] extends 'first' ? Value[] : PromisesValue<Value>[]>;

/**
 * Handle a list of promises, returning their results in an ordered array.
 *
 * If any promise in the list is rejected, the whole function will reject
 * @param items List of promises
 * @param strategy Strategy for handling the promises; rejects on the first error encountered
 * @returns List of results
 */
export async function promises<Items extends unknown[]>(
	items: [...Items],
	strategy: 'first',
): Promise<PromisesItems<Items>>;

/**
 * Handle a list of promises, returning their results in an ordered array.
 *
 * If any promise in the list is rejected, the whole function will reject
 * @param items List of promises
 * @param strategy Strategy for handling the promises; rejects on the first error encountered
 * @returns List of results
 */
export async function promises<Value>(items: Promise<Value>[], strategy: 'first'): Promise<Value[]>;

/**
 * Handle a list of promises, returning their results in an ordered array of rejected and resolved results
 * @param items List of promises
 * @param signal AbortSignal for aborting the operation _(when aborted, the promise will reject with the reason of the signal)_
 * @returns List of results
 */
export async function promises<Items extends unknown[]>(
	items: [...Items],
	signal?: AbortSignal,
): Promise<PromisesValues<PromisesItems<Items>>>;

/**
 * Handle a list of promises, returning their results in an ordered array of rejected and resolved results
 * @param items List of promises
 * @param signal AbortSignal for aborting the operation _(when aborted, the promise will reject with the reason of the signal)_
 * @returns List of results
 */
export async function promises<Value>(
	items: Promise<Value>[],
	signal?: AbortSignal,
): Promise<PromisesValue<Value>[]>;

export async function promises(items: unknown[], options?: unknown): Promise<unknown[]> {
	const {signal, strategy} = getPromisesOptions(options);

	if (signal?.aborted ?? false) {
		return Promise.reject(signal!.reason);
	}

	if (!Array.isArray(items)) {
		return Promise.reject(new TypeError(PROMISE_MESSAGE_EXPECTATION_PROMISES));
	}

	const actual = items.filter(item => item instanceof Promise);
	const {length} = actual;

	if (length === 0) {
		return Promise.reject(new TypeError(PROMISE_MESSAGE_EXPECTATION_PROMISES));
	}

	const complete = strategy === PROMISE_STRATEGY_DEFAULT;

	function abort(): void {
		handlers.reject(signal!.reason);
	}

	signal?.addEventListener('abort', abort, PROMISE_ABORT_OPTIONS);

	const data: PromiseData = {
		last: length - 1,
		result: [] as unknown[],
	};

	let handlers: PromiseHandlers;

	return new Promise((resolve, reject) => {
		handlers = {reject, resolve};

		for (let index = 0; index < length; index += 1) {
			void actual[index]
				.then(value =>
					handleResult(PROMISE_TYPE_FULFILLED, {
						abort,
						complete,
						data,
						handlers,
						index,
						signal,
						value,
					}),
				)
				.catch(reason =>
					handleResult(PROMISE_TYPE_REJECTED, {
						abort,
						complete,
						data,
						handlers,
						index,
						signal,
						value: reason,
					}),
				);
		}
	});
}

promises.result = resultPromises;

/**
 * Handle a list of promises, returning their results in an ordered array of results _({@link Result})_.
 *
 * Depending on the strategy, the function will either reject on the first error encountered or return an array of rejected and resolved results
 * @param items List of promises
 * @param signal AbortSignal for aborting the operation _(when aborted, the promise will reject with the reason of the signal)_
 * @returns List of results
 */
async function resultPromises<Items extends unknown[]>(
	items: [...Items],
	signal?: AbortSignal,
): Promise<PromisesResult<PromisesItems<Items>>>;

/**
 * Handle a list of promises, returning their results in an ordered array of results _({@link Result})_.
 *
 * Depending on the strategy, the function will either reject on the first error encountered or return an array of rejected and resolved results
 * @param items List of promises
 * @param signal AbortSignal for aborting the operation _(when aborted, the promise will reject with the reason of the signal)_
 * @returns List of results
 */
async function resultPromises<Value>(
	items: Promise<Value>[],
	signal?: AbortSignal,
): Promise<Result<Awaited<Value>>[]>;

async function resultPromises(
	items: Promise<unknown>[],
	signal?: AbortSignal,
): Promise<Result<unknown>[]> {
	return promises(items, signal).then(getResultsFromPromises);
}

// #endregion

// #region Exports

export {toPromise as fromResult} from '../result/misc';
export {delay} from './delay';
export {isFulfilled, isRejected} from './helpers';
export {cancelable, toResult} from './misc';
export {
	CancelablePromise,
	PromiseTimeoutError,
	type FulfilledPromise,
	type PromiseOptions,
	type PromisesOptions,
	type PromisesResult,
	type PromiseStrategy,
	type PromisesValues as PromisesValue,
	type PromisesValue as PromisesValueItem,
	type RejectedPromise,
} from './models';
export {timed} from './timed';

// #endregion
