import {getNumberOrDefault} from '../internal/defaults';
import {getLimiter} from '../internal/function/limit';
import {isAsyncFunction, isPlainObject, isPromise} from '../internal/is';
import {attempt} from '../internal/result/attempt';
import {LIMITER_WAIT} from '../models/function/limiter.model';
import {
	RETRY_MESSAGE_CALLBACK,
	RETRY_MESSAGE_FAILED,
	RETRY_MESSAGE_VALUE,
	RetryError,
	type RetryOptions,
} from '../models/function/retry.model';
import type {GenericAsyncCallback, GenericCallback} from '../models/index';

// #region Functions

/**
 * Retry a callback a specified number of times, with a delay between attempts
 *
 * @param callback Callback to retry
 * @param options Retry options
 * @returns Callback result
 */
async function asyncRetry<Callback extends GenericAsyncCallback>(
	callback: Callback,
	options?: RetryOptions,
): Promise<Awaited<ReturnType<Callback>>>;

/**
 * Retry a callback a specified number of times, with a delay between attempts
 *
 * @param callback Callback to retry
 * @param options Retry options
 * @returns Callback result
 */
async function asyncRetry<Callback extends GenericAsyncCallback>(
	callback: Callback,
	options?: RetryOptions,
): Promise<ReturnType<Callback>>;

/**
 * Retry a callback a specified number of times, with a delay between attempts
 *
 * @param callback Callback to retry
 * @param options Retry options
 * @returns Callback result
 */
async function asyncRetry<Callback extends GenericAsyncCallback>(
	callback: Callback,
	options?: RetryOptions,
): Promise<ReturnType<Callback>> {
	async function handle(): Promise<void> {
		const attempted = await attempt(async () => callback());

		if (attempted.ok) {
			resolver(attempted.value);

			return;
		}

		try {
			if (attempts >= times || !when(attempted.error)) {
				rejector(new RetryError(RETRY_MESSAGE_FAILED, attempted.error));
			} else {
				attempts += 1;

				void limiter.run();
			}
		} catch (error) {
			rejector(error);
		}
	}

	const {delay, times, when} = createRetryOptions(options);

	const limiter = getLimiter(LIMITER_WAIT, handle, delay);

	let attempts = 0;

	let rejector: (reason?: unknown) => void;
	let resolver: (value: Awaited<ReturnType<Callback>>) => void;

	return new Promise<Awaited<ReturnType<Callback>>>((resolve, reject) => {
		rejector = reject;
		resolver = resolve;

		void handle();
	});
}

function createRetryOptions(input?: RetryOptions): Required<RetryOptions> {
	const options = isPlainObject(input) ? input : {};

	return {
		delay: getNumberOrDefault(options.delay, 0),
		times: getNumberOrDefault(options.times, 0),
		when: typeof options.when === 'function' ? options.when : shouldRetry,
	};
}

/**
 * Retry a callback a specified number of times, with a delay between attempts
 *
 * @param callback Callback to retry
 * @param options Retry options
 * @returns Callback result
 */
export async function retry<Callback extends GenericAsyncCallback>(
	callback: Callback,
	options?: RetryOptions,
): Promise<Awaited<ReturnType<Callback>>>;

/**
 * Retry a callback a specified number of times, with a delay between attempts
 *
 * @param callback Callback to retry
 * @param options Retry options
 * @returns Callback result
 */
export async function retry<Callback extends GenericAsyncCallback>(
	callback: Callback,
	options?: RetryOptions,
): Promise<Awaited<ReturnType<Callback>>>;

/**
 * Retry a callback a specified number of times, with a delay between attempts
 *
 * @param callback Callback to retry
 * @param options Retry options
 * @returns Callback result
 */
export async function retry<Callback extends GenericAsyncCallback>(
	callback: Callback,
	options?: RetryOptions,
): Promise<Awaited<ReturnType<Callback>>>;

/**
 * Retry a callback a specified number of times
 *
 * @param callback Callback to retry
 * @param options Retry options
 * @returns Callback result
 */
export function retry<Callback extends GenericCallback>(
	callback: Callback,
	options?: Omit<RetryOptions, 'delay'>,
): ReturnType<Callback>;

export function retry<Callback extends GenericCallback>(
	callback: Callback,
	options?: RetryOptions,
): unknown {
	if (typeof callback !== 'function') {
		throw new TypeError(RETRY_MESSAGE_CALLBACK);
	}

	return isAsyncFunction(callback) ? asyncRetry(callback, options) : syncRetry(callback, options);
}

function shouldRetry(): boolean {
	return true;
}

function syncRetry<Callback extends GenericCallback>(
	callback: Callback,
	options?: RetryOptions,
): ReturnType<Callback> {
	const {times, when} = createRetryOptions(options);

	let promised = false;
	let last: unknown;

	for (let index = 0; index <= times; index += 1) {
		try {
			const value = callback();

			if (isPromise(value)) {
				promised = true;

				throw new TypeError(RETRY_MESSAGE_VALUE);
			}

			return value;
		} catch (error) {
			if (promised) {
				throw error;
			}

			if (index >= times || !when(error)) {
				last = error;

				break;
			}
		}
	}

	throw new RetryError(RETRY_MESSAGE_FAILED, last);
}

// #endregion

// #region Exports

export {RetryError};

// #endregion
