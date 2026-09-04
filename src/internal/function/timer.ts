import type {
	AsyncCancelableCallback,
	CancelableCallback,
	GenericAsyncCallback,
	GenericCallback,
} from '../../models';
import {getNumberOrDefault} from '../defaults';

// #region Types

type AsyncItem = {
	parameters: unknown[];
	promise: Promise<unknown>;
	reject: (reason?: unknown) => void;
	resolve: (value?: unknown) => void;
	running: boolean;
};

type TimerType = 'debounce' | 'throttle' | 'wait';

// #endregion

// #region Functions

export function getAsyncTimer<Callback extends GenericAsyncCallback | GenericCallback>(
	type: TimerType,
	callback: Callback,
	time?: number,
): AsyncCancelableCallback<Callback> {
	function cancel(): void {
		clearTimer(id);

		if (last != null && !last.running) {
			last.reject();

			last = undefined;
		}
	}

	async function run(item: AsyncItem): Promise<void> {
		const now = performance.now();

		start ??= now;

		if (interval === 0 || now - start >= interval - TIMER_OFFSET) {
			start = throttle ? now : undefined;

			item.running = true;

			try {
				let result = callback(...item.parameters);

				if (result instanceof Promise) {
					result = await result;
				}

				item.resolve(result);
			} catch (error) {
				item.reject(error);
			} finally {
				item.running = false;
			}
		} else {
			id = startTimer(() => run(item));
		}
	}

	const interval = getNumberOrDefault(time, 0);
	const throttle = type === TIMER_THROTTLE;

	let id: number;
	let last: AsyncItem | undefined;
	let start: number | undefined;

	const timer = (...parameters: Parameters<Callback>): Promise<unknown> => {
		cancel();

		const next: AsyncItem = {
			parameters,
			running: false,
		} as never;

		next.promise = new Promise<unknown>((resolve, reject) => {
			next.reject = reject;
			next.resolve = resolve;
		});

		last = next;

		if (throttle) {
			void run(next);
		} else {
			id = startTimer(() => run(next));
		}

		return next.promise;
	};

	Object.defineProperty(timer, TIMER_CANCEL, {
		value: () => cancel(),
	});

	return timer as AsyncCancelableCallback<Callback>;
}

export function getTimer<Callback extends GenericCallback>(
	type: TimerType,
	callback: Callback,
	time?: number,
): CancelableCallback<Callback> {
	function cancel(): void {
		clearTimer(id);
	}

	function run(): void {
		const now = performance.now();

		start ??= now;

		if (interval === 0 || now - start >= interval - TIMER_OFFSET) {
			start = throttle ? now : undefined;

			callback(...args);
		} else {
			id = startTimer(run);
		}
	}

	const interval = getNumberOrDefault(time, 0);
	const throttle = type === TIMER_THROTTLE;

	let args: Parameters<Callback>;
	let id: number;
	let start: number | undefined;

	const timer = (...parameters: Parameters<Callback>): void => {
		cancel();

		args = parameters;

		if (throttle) {
			run();
		} else {
			id = startTimer(run);
		}
	};

	Object.defineProperty(timer, TIMER_CANCEL, {
		value: () => cancel(),
	});

	return timer as CancelableCallback<Callback>;
}

// #endregion

// #region Variables

const TIMER_CANCEL = 'cancel';

export const TIMER_DEBOUNCE: TimerType = 'debounce';

const TIMER_OFFSET = 5;

export const TIMER_THROTTLE: TimerType = 'throttle';

export const TIMER_WAIT: TimerType = 'wait';

// istanbul ignore next
const clearTimer = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout;

// istanbul ignore next
const startTimer = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : setTimeout;

// #endregion
