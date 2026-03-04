import {getTimer, TIMER_WAIT} from '../internal/function/timer';
import {getPromiseOptions} from './helpers';
import {settlePromise} from './misc';
import {PROMISE_ABORT_OPTIONS, type PromiseOptions} from './models';

// #region Functions

/**
 * Create a delayed promise that resolves after a certain amount of time, or rejects if aborted
 * @param options Options for the delay
 * @returns Delayed promise
 */
export function delay(options?: PromiseOptions): Promise<void>;

/**
 * Create a delayed promise that resolves after a certain amount of time
 * @param time How long to wait for _(in milliseconds; defaults to `0`)_
 * @returns Delayed promise
 */
export function delay(time?: number): Promise<void>;

export function delay(options?: unknown): Promise<void> {
	const {signal, time} = getPromiseOptions(options);

	if (signal?.aborted ?? false) {
		return Promise.reject(signal!.reason);
	}

	function abort(): void {
		timer.cancel();

		rejector(signal!.reason);
	}

	const timer = getTimer(
		TIMER_WAIT,
		() => {
			settlePromise(abort, resolver, undefined, signal);
		},
		time,
	);

	signal?.addEventListener('abort', abort, PROMISE_ABORT_OPTIONS);

	let rejector: (reason: unknown) => void;
	let resolver: () => void;

	return new Promise((resolve, reject) => {
		rejector = reject;
		resolver = resolve;

		if (time === 0) {
			settlePromise(abort, resolve, undefined, signal);
		} else {
			timer();
		}
	});
}

// #endregion
