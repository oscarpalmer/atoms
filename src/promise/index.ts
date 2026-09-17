import {createAborter} from '../internal/aborter';
import {isArrayOrPlainObject} from '../internal/is';
import type {ArrayOrPlainObject, Key, PlainObject} from '../models';
import {
	PROMISE_MESSAGE_EXPECTATION_ATTEMPT,
	PROMISE_MESSAGE_EXPECTATION_ITEMS_EMPTY,
	PROMISE_MESSAGE_EXPECTATION_ITEMS_TYPE,
	PROMISE_STRATEGY_DEFAULT,
	PROMISE_TYPE_FULFILLED,
	PROMISE_TYPE_REJECTED,
} from './constants';
import {createPromiseOptions, createPromisesOptions, getResultsFromPromises} from './helpers';
import {handleResult, settlePromise} from './misc';
import {
	type PromiseData,
	type PromiseHandlers,
	type PromiseOptions,
	type PromiseParameters,
	type PromisesItems,
	type PromisesOptions,
	type PromisesResult,
	type PromiseStrategy,
	type PromisesUnwrapped,
	type PromisesValues,
} from './models';
import {getTimedPromise} from './timed';

// #region Functions

/**
 * Wrap a _Promise_ with safety handlers
 *
 * @param promise _Promise_ to wrap
 * @param options Options for the _Promise_
 * @returns Wrapped _Promise_
 */
export async function attemptPromise<Value>(
	promise: Promise<Value>,
	options?: PromiseOptions | AbortSignal | number,
): Promise<Value>;

/**
 * Wrap a _Promise_-returning callback with safety handlers
 *
 * @param callback Callback to wrap
 * @param options Options for the _Promise_
 * @returns _Promise_-wrapped callback
 */
export async function attemptPromise<Value>(
	callback: () => Promise<Value>,
	options?: PromiseOptions | AbortSignal | number,
): Promise<Value>;

/**
 * Wrap a callback with a _Promise_ and safety handlers
 *
 * @param callback Callback to wrap
 * @param options Options for the _Promise_
 * @returns _Promise_-wrapped callback
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

	const {signal, time} = createPromiseOptions(options);

	if (signal?.aborted ?? false) {
		return Promise.reject(signal?.reason);
	}

	const aborter = createAborter(signal, () => {
		rejector(signal?.reason);
	});

	async function handler(
		resolve: (value: Value) => void,
		reject: (reason: unknown) => void,
	): Promise<void> {
		try {
			let result = isFunction ? value() : await value;

			if (result instanceof Promise) {
				result = await result;
			}

			settlePromise(resolve, result, aborter);
		} catch (error) {
			settlePromise(reject, error, aborter);
		}
	}

	let rejector: (reason: unknown) => void;

	const promise = new Promise<Value>((resolve, reject) => {
		rejector = reject;

		void handler(resolve, reject);
	});

	return time > 0 ? getTimedPromise(promise, time, signal) : promise;
}

/**
 * Handle a list of _Promises_, returning their results in an ordered array
 *
 * _Depending on the strategy, the function will either reject on the first error encountered or return an array of rejected and resolved results_
 *
 * @param items List of _Promises_
 * @param options Options for handling the _Promises_
 * @returns List of results
 */
export async function promises<Items extends unknown[], Options extends PromisesOptions>(
	items: [...Items],
	options?: Options,
): Promise<
	Options['strategy'] extends 'first'
		? PromisesUnwrapped<Items>
		: PromisesValues<PromisesItems<Items>>
>;

/**
 * Handle keyed _Promises_, returning their results in a similarly keyed object
 *
 * _Depending on the strategy, the function will either reject on the first error encountered or return an object of rejected and resolved results_
 *
 * @param items Keyed _Promises_
 * @param options Options for handling the _Promises_
 * @returns Keyed object of results
 */
export async function promises<Items extends PlainObject, Options extends PromisesOptions>(
	items: Items,
	options?: Options,
): Promise<
	Options['strategy'] extends 'first'
		? PromisesUnwrapped<Items>
		: PromisesValues<PromisesItems<Items>>
>;

/**
 * Handle a list of _Promises_, returning their results in an ordered array
 *
 * _If the strategy is `first`, the function will reject on the first error encountered; otherwise, it returns an array of rejected and resolved results_
 *
 * @param items List of _Promises_
 * @param strategy Strategy for handling the _Promises_
 * @returns List of results
 */
export async function promises<Items extends unknown[], Strategy extends PromiseStrategy>(
	items: [...Items],
	strategy: Strategy,
): Promise<
	Strategy extends 'first' ? PromisesUnwrapped<Items> : PromisesValues<PromisesItems<Items>>
>;

/**
 * Handle keyed _Promises_, returning their results in a similarly keyed object
 *
 * _If the strategy is `first`, the function will reject on the first error encountered; otherwise, it returns an object of rejected and resolved results_
 *
 * @param items Keyed _Promises_
 * @param strategy Strategy for handling the _Promises_
 * @returns Keyed object of results
 */
export async function promises<Items extends PlainObject, Strategy extends PromiseStrategy>(
	items: Items,
	strategy: Strategy,
): Promise<
	Strategy extends 'first' ? PromisesUnwrapped<Items> : PromisesValues<PromisesItems<Items>>
>;

/**
 * Handle a list of _Promises_, returning their results in an ordered array
 *
 * @param items List of _Promises_
 * @param signal _AbortSignal_ for aborting all _Promises_
 * @returns List of results
 */
export async function promises<Items extends unknown[]>(
	items: [...Items],
	signal?: AbortSignal,
): Promise<PromisesValues<PromisesItems<Items>>>;

/**
 * Handle keyed _Promises_, returning their results in a similarly keyed object
 *
 * @param items Keyed _Promises_
 * @param signal _AbortSignal_ for aborting all _Promises_
 * @returns Keyed object of results
 */
export async function promises<Items extends PlainObject>(
	items: Items,
	signal?: AbortSignal,
): Promise<PromisesValues<PromisesItems<Items>>>;

export async function promises(items: ArrayOrPlainObject, options?: unknown): Promise<unknown> {
	const {signal, strategy} = createPromisesOptions(options);

	if (signal?.aborted ?? false) {
		return Promise.reject(signal?.reason);
	}

	if (!isArrayOrPlainObject(items)) {
		return Promise.reject(PROMISE_MESSAGE_EXPECTATION_ITEMS_TYPE);
	}

	const isArray = Array.isArray(items);

	const entries: Array<[Key, unknown]> = isArray
		? items.map((item, index) => [index, item])
		: Object.entries(items);

	const actual = entries
		.map(([key, value]) => [key, typeof value === 'function' ? value() : value])
		.filter(([, value]) => value instanceof Promise) as Array<[Key, Promise<unknown>]>;

	const {length} = actual;

	if (length === 0) {
		return Promise.reject(PROMISE_MESSAGE_EXPECTATION_ITEMS_EMPTY);
	}

	const complete = strategy === PROMISE_STRATEGY_DEFAULT;

	const aborter = createAborter(signal, () => {
		handlers.reject(signal?.reason);
	});

	const data: PromiseData = {
		last: length - 1,
		result: isArray ? [] : {},
	};

	let handlers: PromiseHandlers;

	return new Promise((resolve, reject) => {
		handlers = {reject, resolve};

		for (let index = 0; index < length; index += 1) {
			const [key, promise] = actual[index];

			const parameters: PromiseParameters = {
				aborter,
				complete,
				data,
				handlers,
				index,
				key,
			};

			void promise
				.then(value => {
					parameters.value = value;

					handleResult(PROMISE_TYPE_FULFILLED, parameters);
				})
				.catch(reason => {
					parameters.value = reason;

					handleResult(PROMISE_TYPE_REJECTED, parameters);
				});
		}
	});
}

/**
 * Handle a list of _Promises_, returning their results in an ordered array of results _({@link Result})_
 *
 * _Depending on the strategy, the function will either reject on the first error encountered or return an array of rejected and resolved results_
 *
 * _Available as `resultPromises` and `promises.result`_
 *
 * @param items List of _Promises_
 * @param signal AbortSignal for aborting all _Promises_
 * @returns List of results
 */
export async function resultPromises<Items extends unknown[]>(
	items: [...Items],
	signal?: AbortSignal,
): Promise<PromisesResult<PromisesItems<Items>>>;

/**
 * Handle keyed _Promises_, returning their results in a similarly keyed object of results _({@link Result})_
 *
 * _Available as `resultPromises` and `promises.result`_
 *
 * @param items Keyed _Promises_
 * @param signal AbortSignal for aborting all _Promises_
 * @returns Keyed object of results
 */
export async function resultPromises<Items extends PlainObject>(
	items: Items,
	signal?: AbortSignal,
): Promise<PromisesResult<PromisesItems<Items>>>;

export async function resultPromises(
	items: Promise<unknown>[],
	signal?: AbortSignal,
): Promise<unknown> {
	return promises(items, signal).then(getResultsFromPromises);
}

// #endregion

// #region Initialization

promises.result = resultPromises;

// #endregion
