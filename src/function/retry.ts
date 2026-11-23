import {getNumberOrDefault} from '../internal/defaults';
import {getLimiter} from '../internal/function/limit';
import {isAsyncFunction, isPlainObject, isThenable} from '../internal/is';
import {swallow} from '../internal/promise';
import {attempt} from '../internal/result/attempt';
import {LIMITER_WAIT} from '../models/function/limiter.model';
import {
	RETRY_MESSAGE_CALLBACK,
	RETRY_MESSAGE_FAILED,
	RETRY_MESSAGE_PROMISE,
	RetryError,
	type RetryOptions,
} from '../models/function/retry.model';
import type {GenericAsyncCallback, GenericSyncCallback} from '../models/index';

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
		await attempt(async () => callback()).then(attempted =>
			attempted.match({
				error: onError,
				ok(value) {
					resolver(value);
				},
			}),
		);
	}

	function onError(error: unknown): void {
		attempt(() => {
			if (attempts >= times || !when(error)) {
				rejector(new RetryError(RETRY_MESSAGE_FAILED, error));
			} else {
				attempts += 1;

				void limiter.run();
			}
		}).or(rejector);
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
export function retry<Callback extends GenericSyncCallback>(
	callback: Callback,
	options?: Omit<RetryOptions, 'delay'>,
): ReturnType<Callback>;

export function retry<Callback extends GenericSyncCallback>(
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

function syncRetry<Callback extends GenericSyncCallback>(
	callback: Callback,
	options?: RetryOptions,
): ReturnType<Callback> {
	const {times, when} = createRetryOptions(options);

	let promised = false;
	let last: unknown;

	for (let index = 0; index <= times; index += 1) {
		try {
			const value = callback();

			if (isThenable(value)) {
				swallow(value);

				promised = true;

				throw new TypeError(RETRY_MESSAGE_PROMISE);
			}

			return value as ReturnType<Callback>;
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
