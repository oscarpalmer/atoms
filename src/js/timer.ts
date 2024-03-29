/**
 * Callback that runs after the timer has finished (or is stopped)
 * - `finished` is `true` if the timer was allowed to finish, and `false` if it was stopped
 */
type AfterCallback = (finished: boolean) => void;

/**
 * Callback that runs for each iteration of the timer
 */
type IndexedCallback = (index: number) => void;

type Options = {
	/**
	 * Callback to run after the timer has finished (or is stopped)
	 * - `finished` is `true` if the timer was allowed to finish, and `false` if it was stopped
	 */
	afterCallback?: AfterCallback;
	/**
	 * How many times the timer should repeat
	 */
	count?: number;
	/**
	 * Interval between each callback
	 */
	interval?: number;
};

type TimerOptions = {
	afterCallback?: AfterCallback;
	callback: IndexedCallback;
	count: number;
	interval: number;
};

type TimerState = {
	active: boolean;
	frame?: number;
};

type WorkType = 'restart' | 'start' | 'stop';

let milliseconds = 0;

/**
 * A timer that can be started, stopped, and restarted as neeeded
 */
export class Timer {
	private declare readonly state: TimerState;
	private declare readonly options: TimerOptions;

	/**
	 * Is the timer running?
	 */
	get active(): boolean {
		return this.state.active;
	}

	constructor(callback: IndexedCallback, options: Options) {
		this.options = {
			afterCallback: options.afterCallback,
			callback,
			count:
				typeof options.count === 'number' && options.count > 0
					? options.count
					: 1,
			interval:
				typeof options.interval === 'number' && options.interval >= 0
					? options.interval
					: 0,
		};

		this.state = {
			active: false,
		};
	}

	/**
	 * Restarts the timer
	 */
	restart(): Timer {
		return work('restart', this, this.state, this.options);
	}

	/**
	 * Starts the timer
	 */
	start(): Timer {
		return work('start', this, this.state, this.options);
	}

	/**
	 * Stops the timer
	 */
	stop(): Timer {
		return work('stop', this, this.state, this.options);
	}
}

/**
 * - Creates a timer which calls a callback after a certain amount of time, and repeats it a certain amount of times, with an optional callback after it's finished (or stopped)
 * - `options.count` defaults to `Infinity`
 * - `options.time` defaults to `0`
 * - `options.afterCallback` defaults to `undefined`
 */
export function repeat(
	callback: (index: number) => void,
	options?: Options,
): Timer {
	const count =
		typeof options?.count === 'number'
			? options.count
			: Number.POSITIVE_INFINITY;

	return new Timer(callback, {...(options ?? {}), ...{count}}).start();
}

/**
 * - Creates a timer which calls a callback after a certain amount of time
 * - `time` defaults to `0`
 */
export function wait(callback: () => void, time?: number): Timer {
	return new Timer(callback, {
		count: 1,
		interval: time,
	}).start();
}

function work(
	type: WorkType,
	timer: Timer,
	state: TimerState,
	options: TimerOptions,
): Timer {
	if (
		(type === 'start' && timer.active) ||
		(type === 'stop' && !timer.active)
	) {
		return timer;
	}

	const {afterCallback, callback, count, interval} = options;

	if (typeof state.frame === 'number') {
		cancelAnimationFrame(state.frame);

		afterCallback?.(false);
	}

	if (type === 'stop') {
		state.active = false;
		state.frame = undefined;

		return timer;
	}

	state.active = true;

	const isRepeated = count > 0;

	let index = 0;
	let total = count * interval;

	if (total < milliseconds) {
		total = milliseconds;
	}

	let start: DOMHighResTimeStamp | undefined;

	function step(timestamp: DOMHighResTimeStamp): void {
		if (!state.active) {
			return;
		}

		start ??= timestamp;

		const elapsed = timestamp - start;
		const finished = elapsed >= total;

		if (finished || (elapsed - 2 < interval && interval < elapsed + 2)) {
			if (state.active) {
				callback((isRepeated ? index : undefined) as never);
			}

			index += 1;

			if (!finished && index < count) {
				start = undefined;
			} else {
				state.active = false;
				state.frame = undefined;

				afterCallback?.(true);

				return;
			}
		}

		state.frame = requestAnimationFrame(step);
	}

	state.frame = requestAnimationFrame(step);

	return timer;
}

/**
 * Called immediately to calculate an approximate refresh rate in milliseconds
 */
(() => {
	let start: number;

	function fn(time: number) {
		if (start === undefined) {
			start = time;

			requestAnimationFrame(fn);
		} else {
			milliseconds = time - start;
		}
	}

	requestAnimationFrame(fn);
})();
