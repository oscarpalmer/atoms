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

type BaseOptions = {
	/**
	 * Interval between each callback
	 */
	interval: number;
	/**
	 * Maximum amount of time the timer may run for
	 */
	timeout: number;
};

type OptionsWithCount = {
	/**
	 * How many times the timer should repeat
	 */
	count: number;
} & BaseOptions;

type OptionsWithError = {
	/**
	 * Callback to run when an error occurs _(usually a timeout)_
	 */
	errorCallback?: () => void;
};

type RepeatOptions = {
	/**
	 * Callback to run after the timer has finished (or is stopped)
	 * - `finished` is `true` if the timer was allowed to finish, and `false` if it was stopped
	 */
	afterCallback?: AfterCallback;
} & OptionsWithCount &
	OptionsWithError;

type State = {
	active: boolean;
	callback: AnyCallback;
	frame?: number;
};

/**
 * A timer that can be started, stopped, and restarted as neeeded
 */
export type Timer = {
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

type TimerOptions = {} & RepeatOptions;

type WaitOptions = {} & BaseOptions & OptionsWithError;

export type When = {
	/**
	 * Stops the timer
	 */
	stop(): void;
	then(
		resolve?: (() => void) | null,
		reject?: (() => void) | null,
	): Promise<void>;
};

type WhenOptions = {} & OptionsWithCount;

type WorkType = 'restart' | 'start' | 'stop';

function is(value: unknown, pattern: RegExp) {
	return pattern.test((value as PlainObject)?.$timer as string);
}

/**
 * Is the value a repeating timer?
 */
export function isRepeated(value: unknown): value is Timer {
	return is(value, /^repeat$/);
}

/**
 * Is the value a timer?
 */
export function isTimer(value: unknown): value is Timer {
	return is(value, /^repeat|wait$/);
}

/**
 * Is the value a waiting timer?
 */
export function isWaited(value: unknown): value is Timer {
	return is(value, /^wait$/);
}

/**
 * Is the value a conditional timer?
 */
export function isWhen(value: unknown): value is When {
	return is(value, /^when$/) && typeof (value as When).then === 'function';
}

/**
 * Creates a timer which:
 * - calls a callback after a certain amount of time...
 * - ... and repeats it a certain amount of times
 * ---
 * - `options.count` defaults to `Infinity` _(minimum `1`)_
 * - `options.interval` defaults to `0`
 * - `options.timeout` defaults to `30_000` _(30 seconds)_
 */
export function repeat(
	callback: IndexedCallback,
	options?: Partial<RepeatOptions>,
): Timer {
	return timer('repeat', callback, {
		...(options ?? {}),
		...{
			count:
				typeof options?.count === 'number'
					? options.count > 0
						? options.count
						: 1
					: Number.POSITIVE_INFINITY,
		},
	}).start();
}

function timer(
	type: 'repeat' | 'wait',
	callback: AnyCallback,
	options: Partial<TimerOptions>,
): Timer {
	const extended: TimerOptions = {
		afterCallback: options.afterCallback,
		count:
			typeof options.count === 'number' && options.count > 0
				? options.count
				: 1,
		errorCallback: options.errorCallback,
		interval:
			typeof options.interval === 'number' && options.interval >= 0
				? options.interval
				: 0,
		timeout:
			typeof options.timeout === 'number' && options.timeout > 0
				? options.timeout
				: 30_000,
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

	return instance;
}

/**
 * Creates a timer which calls a callback after a certain amount of time
 */
export function wait(callback: () => void): Timer;

/**
 * Creates a timer which calls a callback after a certain amount of time
 */
export function wait(callback: () => void, time: number): Timer;

/**
 * Creates a timer which calls a callback after a certain amount of time
 * - `options.interval` defaults to `0`
 * - `options.timeout` defaults to `30_000` _(30 seconds)_
 */
export function wait(
	callback: () => void,
	options: Partial<WaitOptions>,
): Timer;

export function wait(
	callback: () => void,
	options?: number | Partial<WaitOptions>,
): Timer {
	const optionsIsNumber = typeof options === 'number';

	return timer('wait', callback, {
		count: 1,
		errorCallback: optionsIsNumber ? undefined : options?.errorCallback,
		interval: optionsIsNumber ? options : options?.interval ?? 0,
	}).start();
}

/**
 * - Creates a promise that resolves when a condition is met
 * - If the condition is never met in a timely manner, the promise will reject
 */
export function when(
	condition: () => boolean,
	options?: Partial<WhenOptions>,
): When {
	let rejecter: () => void;
	let resolver: () => void;

	const repeated = repeat(
		() => {
			if (condition()) {
				repeated.stop();

				resolver?.();
			}
		},
		{
			errorCallback() {
				rejecter?.();
			},
			count: options?.count,
			interval: options?.interval,
			timeout: options?.timeout,
		},
	);

	const promise = new Promise<void>((resolve, reject) => {
		resolver = resolve;
		rejecter = reject;
	});

	const instance = Object.create({
		stop() {
			if (repeated.active) {
				repeated.stop();

				rejecter?.();
			}
		},
		// biome-ignore lint/suspicious/noThenProperty: returning a promise-like object, so it's ok ;)
		then(resolve?: () => void, reject?: () => void) {
			repeated.start();

			return promise.then(resolve, reject);
		},
	});

	Object.defineProperties(instance, {
		$timer: {
			get() {
				return 'when';
			},
		},
		active: {
			get() {
				return repeated.active;
			},
		},
	});

	return instance;
}

function work(
	type: WorkType,
	timer: Timer,
	state: State,
	options: RepeatOptions,
): Timer {
	if (
		(type === 'start' && state.active) ||
		(type === 'stop' && !state.active)
	) {
		return timer;
	}

	const {count, interval, timeout} = options;

	if (typeof state.frame === 'number') {
		cancelAnimationFrame(state.frame);

		options.afterCallback?.(false);
	}

	if (type === 'stop') {
		state.active = false;
		state.frame = undefined;

		return timer;
	}

	state.active = true;

	const isRepeated = count > 0;

	const total =
		count === Number.POSITIVE_INFINITY
			? timeout
			: count * (interval > 0 ? interval : 17);

	let current: DOMHighResTimeStamp | null;
	let start: DOMHighResTimeStamp | null;

	let index = 0;

	function finish(finished: boolean, error: boolean) {
		state.active = false;
		state.frame = undefined;

		if (error) {
			options.errorCallback?.();
		}

		options.afterCallback?.(finished);
	}

	function step(timestamp: DOMHighResTimeStamp): void {
		if (!state.active) {
			return;
		}

		current ??= timestamp;
		start ??= timestamp;

		const elapsed = timestamp - current;
		const finished = elapsed >= total;

		if (finished || (elapsed - 2 < interval && interval < elapsed + 2)) {
			if (state.active) {
				state.callback((isRepeated ? index : undefined) as never);
			}

			index += 1;

			switch (true) {
				case !finished && timestamp - start >= timeout:
					finish(false, true);
					return;

				case !finished && index < count:
					current = null;
					break;

				default:
					finish(true, false);
					return;
			}
		}

		state.frame = requestAnimationFrame(step);
	}

	state.frame = requestAnimationFrame(step);

	return timer;
}
