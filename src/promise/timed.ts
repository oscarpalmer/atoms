import {createAborter} from '../internal/abort';
import {getTimer, TIMER_WAIT} from '../internal/function/timer';
import type {RequiredKeys} from '../models';
import {PROMISE_MESSAGE_EXPECTATION_TIMED} from './constants';
import {getPromiseOptions} from './helpers';
import {settlePromise} from './misc';
import {PromiseTimeoutError, type PromiseOptions} from './models';

// #region Functions

export async function getTimedPromise<Value>(
	promise: Promise<Value>,
	time: number,
	signal?: AbortSignal,
): Promise<Value> {
	const aborter = createAborter(signal, () => {
		timer.cancel();

		rejector(signal?.reason);
	});

	const timer = getTimer(
		TIMER_WAIT,
		() => settlePromise(rejector, new PromiseTimeoutError(), aborter),
		time,
	);

	let rejector: (reason: unknown) => void;

	return Promise.race<Value>([
		promise,
		new Promise((_, reject) => {
			rejector = reject;

			timer();
		}),
	]).then(value => {
		aborter?.cancel();
		timer.cancel();

		rejector(undefined);

		return value;
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
	if (!(promise instanceof Promise)) {
		return Promise.reject(new TypeError(PROMISE_MESSAGE_EXPECTATION_TIMED));
	}

	const {signal, time} = getPromiseOptions(options);

	if (signal?.aborted ?? false) {
		return Promise.reject(signal?.reason);
	}

	return time > 0 ? getTimedPromise(promise, time, signal) : promise;
}

// #endregion
