import {milliseconds} from './constants';
import {getOptions, work} from './functions';
import type {
	AnyCallback,
	IndexedCallback,
	RepeatOptions,
	TimerOptions,
	TimerState,
	WaitOptions,
} from './models';

export abstract class BasicTimer<State> {
	protected declare readonly $timer: string;
	protected declare readonly state: State;

	constructor(type: 'repeat' | 'wait' | 'when', state: State) {
		this.$timer = type;
		this.state = state;
	}

	/**
	 * Is the timer running?
	 */
	abstract readonly active: boolean;

	/**
	 * Is the timer paused?
	 */
	abstract readonly paused: boolean;
}

/**
 * A timer that can be started, stopped, and restarted as neeeded
 */
export class Timer extends BasicTimer<TimerState> {
	private declare readonly options: TimerOptions;

	get active() {
		return this.state.active;
	}

	get paused() {
		return this.state.paused;
	}

	/**
	 * Gets the traced location of the timer
	 */
	get trace() {
		return globalThis._atomic_timer_debug ? this.state.trace : undefined;
	}

	constructor(
		type: 'repeat' | 'wait',
		state: TimerState,
		options: TimerOptions,
	) {
		super(type, state);

		this.options = options;
	}

	/**
	 * Continues the timer _(if it was paused)_
	 */
	continue(): Timer {
		return work('continue', this, this.state, this.options);
	}

	/**
	 * Pauses the timer _(if it was running)_
	 */
	pause(): Timer {
		return work('pause', this, this.state, this.options);
	}

	/**
	 * Restarts the timer _(if it was running)_
	 */
	restart(): Timer {
		return work('restart', this, this.state, this.options);
	}

	/**
	 * Starts the timer _(if it was stopped)_
	 */
	start(): Timer {
		return work('start', this, this.state, this.options);
	}

	/**
	 * Stops the timer _(if it was running)_
	 */
	stop(): Timer {
		return work('stop', this, this.state, this.options);
	}
}

class TimerTrace extends Error {
	constructor() {
		super();

		this.name = 'TimerTrace';
	}
}

/**
 * Creates a timer which:
 * - calls a callback after a certain amount of time...
 * - ... and repeats it a certain amount of times
 * ---
 * - `options.count` defaults to `Infinity`
 * - `options.interval` defaults to `1000/60` _(1 frame)_
 * - `options.timeout` defaults to `Infinity`
 */
export function repeat(
	callback: IndexedCallback,
	options?: Partial<RepeatOptions>,
): Timer {
	return timer('repeat', callback, options ?? {}, true);
}

export function timer(
	type: 'repeat' | 'wait',
	callback: AnyCallback,
	partial: Partial<TimerOptions>,
	start: boolean,
): Timer {
	const isRepeated = type === 'repeat';
	const options = getOptions(partial, isRepeated);

	const instance = new Timer(
		type,
		{
			callback,
			isRepeated,
			active: false,
			minimum: options.interval - (options.interval % milliseconds) / 2,
			paused: false,
			trace: new TimerTrace(),
		},
		options,
	);

	if (start) {
		instance.start();
	}

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
 * - `options.interval` defaults to `1000/60` _(1 frame)_
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
	return timer(
		'wait',
		callback,
		options == null || typeof options === 'number'
			? {
					interval: options,
				}
			: options,
		true,
	);
}
