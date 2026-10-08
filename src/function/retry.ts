import {getNumberOrDefault} from '../internal/defaults';
import {getLimiter} from '../internal/function/limit';
import {isPlainObject} from '../internal/is';
import {asyncAttempt, attempt} from '../internal/result/attempt';
import {LIMITER_WAIT} from '../models/function/limiter.model';
import {
	RETRY_MESSAGE_EXPECTATION,
	RETRY_MESSAGE_FAILED,
	RetryError,
	type RetryOptions,
} from '../models/function/retry.model';
import type {GenericAsyncCallback, GenericCallback} from '../models/index';

// #region Functions

/**
 * Retry a callback a specified number of times, with a delay between attempts
 *
 * _Available as `asyncRetry` and `retry.async`_
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
 * _Available as `asyncRetry` and `retry.async`_
 *
 * @param callback Callback to retry
 * @param options Retry options
 * @returns Callback result
 */
async function asyncRetry<Callback extends GenericCallback>(
	callback: Callback,
	options?: RetryOptions,
): Promise<ReturnType<Callback>>;

/**
 * Retry a callback a specified number of times, with a delay between attempts
 *
 * _Available as `asyncRetry` and `retry.async`_
 *
 * @param callback Callback to retry
 * @param options Retry options
 * @returns Callback result
 */
async function asyncRetry<Callback extends GenericCallback>(
	callback: Callback,
	options?: RetryOptions,
): Promise<ReturnType<Callback>> {
	if (typeof callback !== 'function') {
		throw new TypeError(RETRY_MESSAGE_EXPECTATION);
	}

	async function handle(): Promise<void> {
		const result = await asyncAttempt(async () => callback());

		if (result.ok) {
			resolver(result.value);
		} else {
			if (attempts >= times || !when(result.error)) {
				rejector(new RetryError(RETRY_MESSAGE_FAILED, result.error));
			} else {
				attempts += 1;

				void limiter.run();
			}
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
 * Retry a callback a specified number of times
 *
 * @param callback Callback to retry
 * @param options Retry options
 * @returns Callback result
 */
export function retry<Callback extends GenericCallback>(
	callback: Callback,
	options?: Omit<RetryOptions, 'delay'>,
): ReturnType<Callback> {
	if (typeof callback !== 'function') {
		throw new TypeError(RETRY_MESSAGE_EXPECTATION);
	}

	const {times, when} = createRetryOptions(options);

	let last: unknown;

	for (let index = 0; index <= times; index += 1) {
		const result = attempt(callback);

		if (result.ok) {
			return result.value;
		}

		if (index >= times || !when(result.error)) {
			last = result.error;

			break;
		}
	}

	throw new RetryError(RETRY_MESSAGE_FAILED, last);
}

function shouldRetry(): boolean {
	return true;
}

// #endregion

// #region Namespace

export declare namespace retry {
	export var async: typeof asyncRetry;
}

// #endregion

// #region Initialization

retry.async = asyncRetry;

// #endregion

// #region Exports

export {RetryError};
