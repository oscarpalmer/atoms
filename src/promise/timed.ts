import type {RequiredKeys} from '../models';
import {getPromiseOptions} from './helpers';
import {settlePromise} from './misc';
import {
	PROMISE_ABORT_OPTIONS,
	PROMISE_EVENT_NAME,
	PROMISE_MESSAGE_EXPECTATION_TIMED,
	PromiseTimeoutError,
	type PromiseOptions,
} from './models';

// #region Functions

export async function getTimedPromise<Value>(
	promise: Promise<Value>,
	time: number,
	signal?: AbortSignal,
): Promise<Value> {
	function abort(): void {
		cancelAnimationFrame(frame);

		rejector(signal!.reason);
	}

	function run(now: DOMHighResTimeStamp): void {
		start ??= now;

		if (time === 0 || now - start >= time - 5) {
			settlePromise(abort, rejector, new PromiseTimeoutError(), signal);
		} else {
			frame = requestAnimationFrame(run);
		}
	}

	signal?.addEventListener(PROMISE_EVENT_NAME, abort, PROMISE_ABORT_OPTIONS);

	let frame: DOMHighResTimeStamp;
	let rejector: (reason: unknown) => void;
	let start: DOMHighResTimeStamp;

	return Promise.race<Value>([
		promise,
		new Promise((_, reject) => {
			rejector = reject;

			frame = requestAnimationFrame(run);
		}),
	]).then(value => {
		cancelAnimationFrame(frame);

		signal?.removeEventListener(PROMISE_EVENT_NAME, abort);

		return value;
	});
}

/**
 * Create a promise that should be settled within a certain amount of time
 * @param promise Promise to settle
 * @param options Timed options
 * @returns Timed promise
 */
export async function timed<Value>(
	promise: Promise<Value>,
	options: RequiredKeys<PromiseOptions, 'time'>,
): Promise<Value>;

/**
 * Create a promise that should be settled within a certain amount of time
 * @param promise Promise to settle
 * @param time How long to wait for _(in milliseconds; defaults to `0`)_
 * @returns Timed promise
 */
export async function timed<Value>(promise: Promise<Value>, time: number): Promise<Value>;

export async function timed<Value>(promise: Promise<Value>, options: unknown): Promise<Value> {
	if (!(promise instanceof Promise)) {
		return Promise.reject(new TypeError(PROMISE_MESSAGE_EXPECTATION_TIMED));
	}

	const {signal, time} = getPromiseOptions(options);

	if (signal?.aborted ?? false) {
		return Promise.reject(signal!.reason);
	}

	return time > 0 ? getTimedPromise(promise, time, signal) : promise;
}

// #endregion
