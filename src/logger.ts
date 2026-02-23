import {noop} from './internal/function/misc';

// #region Types

class Logger {
	/**
	 * Log any number of values at the "debug" log level
	 */
	get debug(): typeof console.debug {
		return enabled ? console.debug : noop;
	}

	/**
	 * Log the value and shows all its properties
	 */
	get dir(): typeof console.dir {
		return enabled ? console.dir : noop;
	}

	/**
	 * Is logging to the console enabled? _(defaults to `true`)_
	 */
	get enabled(): boolean {
		return enabled;
	}

	/**
	 * Enable or disable logging to the console
	 */
	set enabled(value: boolean) {
		enabled = typeof value === 'boolean' ? value : enabled;
	}

	/**
	 * Log any number of values at the "error" log level
	 */
	get error(): typeof console.error {
		return enabled ? console.error : noop;
	}

	/**
	 * Log any number of values at the "info" log level
	 */
	get info(): typeof console.info {
		return enabled ? console.info : noop;
	}

	/**
	 * Log any number of values at the "log" log level
	 */
	get log(): typeof console.log {
		return enabled ? console.log : noop;
	}

	/**
	 * Log data as a table, with optional properties to use as columns
	 */
	get table(): typeof console.table {
		return enabled ? console.table : noop;
	}

	/**
	 * Log any number of values together with a trace from where it was called
	 */
	get trace(): typeof console.trace {
		return enabled ? console.trace : noop;
	}

	/**
	 * Log any number of values at the "warn" log level
	 */
	get warn(): typeof console.warn {
		return enabled ? console.warn : noop;
	}

	/**
	 * Start a logged timer with a label
	 * @param label Label for the timer
	 * @returns Time instance
	 */
	time(label: string): Time {
		return new Time(label);
	}
}

class Time {
	#logger: typeof console.timeLog | undefined;
	#stopper: typeof console.timeEnd | undefined;

	readonly #state: TimeState;

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

const logger = new Logger();

let enabled = true;

// #endregion

// #region Exports

export {logger, type Logger, type Time};

// #endregion
