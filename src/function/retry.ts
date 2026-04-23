import {getTimer, TIMER_WAIT} from '../internal/function/timer';
import {isPlainObject} from '../internal/is';
import type {GenericAsyncCallback, GenericCallback} from '../models';

// #region Types

export class RetryError extends Error {
	constructor(
		message: string,
		readonly original: unknown,
	) {
		super(message);

		this.name = ERROR_NAME;
	}
}

export type RetryOptions = {
	delay?: number;
	times?: number;
	when?: (error: unknown) => boolean;
};

// #endregion

// #region Functions

/**
 * Retry a callback a specified number of times, with a delay between attempts
 *
 * Available as `asyncRetry` and `retry.async`
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
 * Available as `asyncRetry` and `retry.async`
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
 * Available as `asyncRetry` and `retry.async`
 * @param callback Callback to retry
 * @param options Retry options
 * @returns Callback result
 */
async function asyncRetry<Callback extends GenericCallback>(
	callback: Callback,
	options?: RetryOptions,
): Promise<ReturnType<Callback>> {
	if (typeof callback !== 'function') {
		throw new TypeError(MESSAGE_EXPECTATION);
	}

	async function handle(): Promise<void> {
		try {
			const result = await callback();

			resolver(result);
		} catch (error) {
			if (attempts >= times || !when(error)) {
				rejector(new RetryError(MESSAGE_FAILED, error));
			} else {
				attempts += 1;

				void timer();
			}
		}
	}

	const {delay, times, when} = getRetryOptions(options);

	const timer = getTimer(TIMER_WAIT, handle, delay);

	let attempts = 0;

	let rejector: (reason?: unknown) => void;
	let resolver: (value: Awaited<ReturnType<Callback>>) => void;

	return new Promise<Awaited<ReturnType<Callback>>>((resolve, reject) => {
		rejector = reject;
		resolver = resolve;

		void handle();
	});
}

function getRetryNumber(value?: unknown): number {
	return typeof value === 'number' && value > 0 ? value : 0;
}

function getRetryOptions(input?: RetryOptions): Required<RetryOptions> {
	const options = isPlainObject(input) ? input : {};

	return {
		delay: getRetryNumber(options.delay),
		times: getRetryNumber(options.times),
		when: typeof options.when === 'function' ? options.when : shouldRetry,
	};
}

/**
 * Retry a callback a specified number of times
 * @param callback Callback to retry
 * @param options Retry options
 * @returns Callback result
 */
export function retry<Callback extends GenericCallback>(
	callback: Callback,
	options?: Omit<RetryOptions, 'delay'>,
): ReturnType<Callback> {
	if (typeof callback !== 'function') {
		throw new TypeError(MESSAGE_EXPECTATION);
	}

	const {times, when} = getRetryOptions(options);

	let last: unknown;

	for (let index = 0; index <= times; index += 1) {
		try {
			const result = callback();

			return result;
		} catch (error) {
			if (index >= times || !when(error)) {
				last = error;

				break;
			}
		}
	}

	throw new RetryError(MESSAGE_FAILED, last);
}

retry.async = asyncRetry;

function shouldRetry(): boolean {
	return true;
}

// #endregion

// #region Variables

const ERROR_NAME = 'RetryError';

const MESSAGE_EXPECTATION = 'Retry expected a function';

const MESSAGE_FAILED = 'Retry failed';

// #endregion
