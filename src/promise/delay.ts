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
		cancelAnimationFrame(frame);

		rejector(signal!.reason);
	}

	function run(now: DOMHighResTimeStamp): void {
		start ??= now;

		if (now - start >= time - 5) {
			settlePromise(abort, resolver, undefined, signal);
		} else {
			frame = requestAnimationFrame(run);
		}
	}

	signal?.addEventListener('abort', abort, PROMISE_ABORT_OPTIONS);

	let frame: DOMHighResTimeStamp;
	let rejector: (reason: unknown) => void;
	let resolver: () => void;
	let start: DOMHighResTimeStamp;

	return new Promise((resolve, reject) => {
		rejector = reject;
		resolver = resolve;

		if (time === 0) {
			settlePromise(abort, resolve, undefined, signal);
		} else {
			frame = requestAnimationFrame(run);
		}
	});
}

// #endregion
