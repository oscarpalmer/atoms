import type {
	AsyncCancelableCallback,
	CancelableCallback,
	GenericAsyncCallback,
	GenericCallback,
} from '../../models';

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
	async function run(item: AsyncItem): Promise<void> {
		const now = performance.now();

		start ??= now;

		if (interval === 0 || now - start >= interval - OFFSET) {
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

	const interval = getInterval(time);
	const throttle = type === TIMER_THROTTLE;

	let id: number;
	let last: AsyncItem;
	let start: number | undefined;

	const timer = (...parameters: Parameters<Callback>): Promise<unknown> => {
		timer.cancel();

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
			run(next);
		} else {
			id = startTimer(() => run(next));
		}

		return next.promise;
	};

	timer.cancel = (): void => {
		clearTimer(id);

		if (last != null && !last.running) {
			last.reject();
		}
	};

	return timer as AsyncCancelableCallback<Callback>;
}

function getInterval(value: unknown): number {
	return typeof value === 'number' && value > 0 ? value : 0;
}

export function getTimer<Callback extends GenericCallback>(
	type: TimerType,
	callback: Callback,
	time?: number,
): CancelableCallback<Callback> {
	function run(): void {
		const now = performance.now();

		start ??= now;

		if (interval === 0 || now - start >= interval - OFFSET) {
			start = throttle ? now : undefined;

			callback(...args);
		} else {
			id = startTimer(run);
		}
	}

	const interval = getInterval(time);
	const throttle = type === TIMER_THROTTLE;

	let args: Parameters<Callback>;
	let id: number;
	let start: number | undefined;

	const timer = (...parameters: Parameters<Callback>): void => {
		timer.cancel();

		args = parameters;

		if (throttle) {
			run();
		} else {
			id = startTimer(run);
		}
	};

	timer.cancel = (): void => {
		clearTimer(id);
	};

	return timer as CancelableCallback<Callback>;
}

// #endregion

// #region Variables

const OFFSET = 5;

export const TIMER_DEBOUNCE: TimerType = 'debounce';

export const TIMER_THROTTLE: TimerType = 'throttle';

export const TIMER_WAIT: TimerType = 'wait';

// istanbul ignore next
const clearTimer = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout;

// istanbul ignore next
const startTimer = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : setTimeout;

// #endregion
