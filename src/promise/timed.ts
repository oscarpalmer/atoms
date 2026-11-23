import {createAborter} from '../internal/aborter';
import {getLimiter} from '../internal/function/limit';
import {isPromise} from '../internal/is';
import {swallow} from '../internal/promise';
import {LIMITER_WAIT} from '../models/function/limiter.model';
import type {RequiredKeys} from '../models/misc.model';
import {PROMISE_MESSAGE_TIMED, TimedError, type PromiseOptions} from '../models/promise.model';
import {createPromiseOptions} from './helpers';
import {settlePromise} from './misc';

// #region Functions

/**
 * @internal
 */
export async function getTimedPromise<Value>(
	promise: Promise<Value>,
	time: number,
	signal?: AbortSignal,
): Promise<Value> {
	const aborter = createAborter(signal, () => {
		limiter.cancel();

		rejector(signal?.reason);
	});

	const limiter = getLimiter(
		LIMITER_WAIT,
		() => settlePromise(rejector, new TimedError(), aborter),
		time,
	);

	let rejector: (reason: unknown) => void;

	return Promise.race<Value>([
		promise,
		new Promise((_, reject) => {
			rejector = reject;

			limiter.run();
		}),
	]).finally(() => {
		aborter?.cancel();
		limiter.cancel();
	});
}

/**
 * Create a _Promise_ that should be settled within a certain amount of time
 *
 * @param promise _Promise_ to settle
 * @param options Timed options
 * @returns Timed _Promise_
 */
export async function timed<Value>(
	promise: Promise<Value>,
	options: RequiredKeys<PromiseOptions, 'time'>,
): Promise<Value>;

/**
 * Create a _Promise_ that should be settled within a certain amount of time
 *
 * @param promise _Promise_ to settle
 * @param time How long to wait for _(in milliseconds; defaults to `0`)_
 * @returns Timed _Promise_
 */
export async function timed<Value>(promise: Promise<Value>, time: number): Promise<Value>;

export async function timed<Value>(promise: Promise<Value>, options: unknown): Promise<Value> {
	if (!isPromise(promise)) {
		throw new TypeError(PROMISE_MESSAGE_TIMED);
	}

	const {signal, time} = createPromiseOptions(options);

	if (signal?.aborted ?? false) {
		swallow(promise);

		throw signal?.reason;
	}

	return time > 0 ? getTimedPromise(promise, time, signal) : promise;
}

// #endregion
