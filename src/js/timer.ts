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

type Timer = {
	/**
	 * Is the timer running?
	 */
	get active(): boolean;
	/**
	 * Restarts the timer
	 */
	restart: () => Timer;
	/**
	 * Starts the timer
	 */
	start: () => Timer;
	/**
	 * Stops the timer
	 */
	stop: () => Timer;
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
	const count = typeof options?.count === 'number' ? options.count : Infinity;

	return timer(callback, {...{count}, ...(options ?? {})}).start();
}

function timer(callback: IndexedCallback, config: Options): Timer {
	const options: TimerOptions = {
		afterCallback:
			typeof config.afterCallback === 'function'
				? config.afterCallback
				: undefined,
		callback,
		count:
			typeof config.count === 'number' && config.count >= 1 ? config.count : 1,
		interval:
			typeof config.interval === 'number' && config.interval >= 0
				? config.interval
				: 0,
	};

	const state: TimerState = {
		active: false,
	};

	const timer = Object.create(null);

	Object.defineProperties(timer, {
		active: {
			get() {
				return state.active;
			},
		},
		restart: {
			value() {
				return work('restart', timer, state, options);
			},
		},
		start: {
			value() {
				return work('start', timer, state, options);
			},
		},
		stop: {
			value() {
				return work('stop', timer, state, options);
			},
		},
	});

	return timer;
}

/**
 * - Creates a timer which calls a callback after a certain amount of time
 * - `time` defaults to `0`
 */
export function wait(callback: () => void, time?: number): Timer {
	return timer(callback, {
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
	const milliseconds = 1000 / 60;

	let index = 0;

	let start: DOMHighResTimeStamp | undefined;

	function step(timestamp: DOMHighResTimeStamp): void {
		if (!state.active) {
			return;
		}

		start ??= timestamp;

		const elapsed = timestamp - start;
		const maximum = elapsed + milliseconds;
		const minimum = elapsed - milliseconds;

		if (minimum < interval && interval < maximum) {
			if (state.active) {
				callback((isRepeated ? index : undefined) as never);
			}

			index += 1;

			if (index < count) {
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
