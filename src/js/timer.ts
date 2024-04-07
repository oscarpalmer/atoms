import type {PlainObject} from './models';

/**
 * Callback that runs after the timer has finished (or is stopped)
 * - `finished` is `true` if the timer was allowed to finish, and `false` if it was stopped
 */
type AfterCallback = (finished: boolean) => void;

type AnyCallback = (() => void) | IndexedCallback;

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
	count: number;
	/**
	 * Interval between each callback
	 */
	interval: number;
};

type State = {
	active: boolean;
	callback: AnyCallback;
	frame?: number;
};

/**
 * A timer that can be started, stopped, and restarted as neeeded
 */
type Timer = {
	/**
	 * Is the timer running?
	 */
	get active(): boolean;
	/**
	 * Restarts the timer
	 */
	restart(): Timer;
	/**
	 * Starts the timer
	 */
	start(): Timer;
	/**
	 * Stops the timer
	 */
	stop(): Timer;
};

type WorkType = 'restart' | 'start' | 'stop';

let milliseconds = 0;

/**
 * Is the value a repeating timer?
 */
export function isRepeated(value: unknown): value is Timer {
	return /^repeat$/.test(((value as PlainObject)?.$timer as string) ?? '');
}

/**
 * Is the value a timer?
 */
export function isTimer(value: unknown): value is Timer {
	return /^repeat|wait$/.test(((value as PlainObject)?.$timer as string) ?? '');
}

/**
 * Is the value a waiting timer?
 */
export function isWaited(value: unknown): value is Timer {
	return /^wait$/.test(((value as PlainObject)?.$timer as string) ?? '');
}

/**
 * - Creates a timer which calls a callback after a certain amount of time, and repeats it a certain amount of times, with an optional callback after it's finished (or stopped)
 * - `options.count` defaults to `Infinity`
 * - `options.time` defaults to `0`
 * - `options.afterCallback` defaults to `undefined`
 */
export function repeat(
	callback: IndexedCallback,
	options?: Partial<Options>,
): Timer {
	const count =
		typeof options?.count === 'number'
			? options.count
			: Number.POSITIVE_INFINITY;

	return timer('repeat', callback, {...(options ?? {}), ...{count}}).start();
}

function timer(
	type: 'repeat' | 'wait',
	callback: AnyCallback,
	options: Partial<Options>,
): Timer {
	const extended: Options = {
		afterCallback: options.afterCallback,
		count:
			typeof options.count === 'number' && options.count > 0
				? options.count
				: 1,
		interval:
			typeof options.interval === 'number' && options.interval >= 0
				? options.interval
				: 0,
	};

	const state: State = {
		callback,
		active: false,
	};

	const instance = Object.create({
		restart() {
			return work('restart', this as Timer, state, extended);
		},
		start() {
			return work('start', this as Timer, state, extended);
		},
		stop() {
			return work('stop', this as Timer, state, extended);
		},
	});

	Object.defineProperties(instance, {
		$timer: {
			get() {
				return type;
			},
		},
		active: {
			get() {
				return state.active;
			},
		},
	});

	return instance.start();
}

/**
 * - Creates a timer which calls a callback after a certain amount of time
 * - `time` defaults to `0`
 */
export function wait(callback: () => void, time?: number): Timer {
	return timer('wait', callback, {
		count: 1,
		interval: time ?? 0,
	});
}

function work(
	type: WorkType,
	timer: Timer,
	state: State,
	options: Options,
): Timer {
	if (
		(type === 'start' && state.active) ||
		(type === 'stop' && !state.active)
	) {
		return timer;
	}

	const {afterCallback, count, interval} = options;

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
				state.callback((isRepeated ? index : undefined) as never);
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
		if (start == null) {
			start = time;

			requestAnimationFrame(fn);
		} else {
			milliseconds = time - start;
		}
	}

	requestAnimationFrame(fn);
})();
