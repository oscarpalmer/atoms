import type {CancelableCallback, GenericCallback} from '../../models';

// #region Types

type TimerType = 'debounce' | 'throttle' | 'wait';

// #endregion

// #region Functions

function getInterval(value: unknown): number {
	return typeof value === 'number' && value > 0 ? value : 0;
}

export function getTimer<Callback extends GenericCallback>(
	type: TimerType,
	callback: Callback,
	time?: number,
): CancelableCallback<Callback> {
	const interval = getInterval(time);

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

	const throttle = type === TIMER_THROTTLE;

	let args: Parameters<Callback>;
	let id: number;
	let start: number | undefined;

	const timer = (...parameters: Parameters<Callback>): void => {
		timer.cancel();

		args = parameters;

		id = startTimer(run);
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

const clearTimer = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout;

const startTimer = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : setTimeout;

// #endregion
