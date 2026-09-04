import {createAborter} from '../internal/abort';
import {getTimer, TIMER_WAIT} from '../internal/function/timer';
import {createPromiseOptions} from './helpers';
import {settlePromise} from './misc';
import {type PromiseOptions} from './models';

// #region Functions

/**
 * Create a delayed promise that resolves after a certain amount of time, or rejects if aborted
 *
 * @param options Options for the delay
 * @returns Delayed promise
 */
export function delay(options?: PromiseOptions): Promise<void>;

/**
 * Create a delayed promise that resolves after a certain amount of time
 *
 * @param time How long to wait for _(in milliseconds; defaults to `0`)_
 * @returns Delayed promise
 */
export function delay(time?: number): Promise<void>;

export function delay(options?: unknown): Promise<void> {
	const {signal, time} = createPromiseOptions(options);

	if (signal?.aborted ?? false) {
		return Promise.reject(signal?.reason);
	}

	const aborter = createAborter(signal, () => {
		timer.cancel();

		rejector(signal?.reason);
	});

	const timer = getTimer(TIMER_WAIT, () => settlePromise(resolver, undefined, aborter), time);

	let rejector: (reason: unknown) => void;
	let resolver: () => void;

	return new Promise((resolve, reject) => {
		rejector = reject;
		resolver = resolve;

		if (time === 0) {
			settlePromise(resolver, undefined, aborter);
		} else {
			timer();
		}
	});
}

// #endregion
