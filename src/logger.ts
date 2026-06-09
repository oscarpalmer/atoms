import {noop} from './internal/function/misc';

// #region Types

type LoggerInstance = {
	/**
	 * Log any number of values at the "debug" log level
	 */
	get debug(): typeof console.debug;

	/**
	 * Log the value and shows all its properties
	 */
	get dir(): typeof console.dir;

	/**
	 * Is logging to the console enabled? _(defaults to `true`)_
	 */
	get enabled(): boolean;

	/**
	 * Enable or disable logging to the console
	 */
	set enabled(value: boolean);

	/**
	 * Log any number of values at the "error" log level
	 */
	get error(): typeof console.error;

	/**
	 * Log any number of values at the "info" log level
	 */
	get info(): typeof console.info;

	/**
	 * Log any number of values at the "log" log level
	 */
	get log(): typeof console.log;

	/**
	 * Log data as a table, with optional properties to use as columns
	 */
	get table(): typeof console.table;

	/**
	 * Log any number of values together with a trace from where it was called
	 */
	get trace(): typeof console.trace;

	/**
	 * Log any number of values at the "warn" log level
	 */
	get warn(): typeof console.warn;

	/**
	 * Start a timed logger with a label
	 *
	 * @param label Label for the logger
	 * @returns _TimedLogger_ instance
	 */
	time(label: string): TimedLogger;
};

/**
 * A named timer that can be used to log durations to the console
 */
class TimedLogger {
	#logger: typeof console.timeLog | undefined;
	#stopper: typeof console.timeEnd | undefined;

	readonly #state: TimeState;

	/**
	 * Is the timer active? _(i.e. has it been started and not stopped, and is logging enabled?)_
	 */
	get active(): boolean {
		return this.#state.started && !this.#state.stopped && enabled;
	}

	/**
	 * Log the current duration of the timer _(ignored if logging is disabled)_
	 */
	get log(): () => void {
		return this.active ? this.#logger! : noop;
	}

	/**
	 * Stop the timer and logs the total duration
	 *
	 * _(Will always log the total duration, even if logging is disabled)_
	 */
	get stop(): () => void {
		return this.active ? this.#stopTimer() : noop;
	}

	constructor(label: string) {
		this.#logger = console.timeLog.bind(console, label);
		this.#stopper = console.timeEnd.bind(console, label);

		this.#state = {
			label,
			started: enabled,
			stopped: false,
		};

		if (this.#state.started) {
			console.time(label);
		}
	}

	#stopTimer(): () => void {
		const stopper = this.#stopper!;

		this.#state.stopped = true;

		this.#logger = undefined;
		this.#stopper = undefined;

		return stopper;
	}
}

type TimeState = {
	label: string;
	started: boolean;
	stopped: boolean;
};

// #endregion

// #region Variables

const methods = ['debug', 'dir', 'error', 'info', 'log', 'table', 'trace', 'warn'] as const;

/**
 * A logger that can be used to log messages to the console
 *
 * _(Logging can be enabled or disabled by setting the `enabled` property)_
 */
const Logger = (() => {
	const instance = {};

	Object.defineProperties(instance, {
		enabled: {
			get() {
				return enabled;
			},
			set(value: boolean) {
				enabled = typeof value === 'boolean' ? value : enabled;
			},
		},
		time: {
			value(label: string) {
				return new TimedLogger(label);
			},
		},
	});

	for (const method of methods) {
		Object.defineProperty(instance, method, {
			get() {
				return enabled ? console[method].bind(console) : noop;
			},
		});
	}

	return Object.freeze(instance);
})() as LoggerInstance;

let enabled = true;

// #endregion

// #region Exports

export {Logger, type TimedLogger};

// #endregion
