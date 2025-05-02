import {noop} from './internal/function';

let enabled = true;

class Logger {
	/**
	 * Log any number of values at the "debug" log level
	 */
	get debug() {
		return enabled ? console.debug : noop;
	}

	/**
	 * Log the value and shows all its properties
	 */
	get dir() {
		return enabled ? console.dir : noop;
	}

	/**
	 * Is logging to the console enabled? _(defaults to `true`)_
	 */
	get enabled() {
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
	get error() {
		return enabled ? console.error : noop;
	}

	/**
	 * Log any number of values at the "info" log level
	 */
	get info() {
		return enabled ? console.info : noop;
	}

	/**
	 * Log any number of values at the "log" log level
	 */
	get log() {
		return enabled ? console.log : noop;
	}

	/**
	 * Log data as a table, with optional properties to use as columns
	 */
	get table() {
		return enabled ? console.table : noop;
	}

	/**
	 * Log any number of values together with a trace from where it was called
	 */
	get trace() {
		return enabled ? console.trace : noop;
	}

	/**
	 * Log any number of values at the "warn" log level
	 */
	get warn() {
		return enabled ? console.warn : noop;
	}

	/**
	 * - Start a logged timer with a label
	 * - Returns a `Time`-object for logging the current duration of the timer and stopping the timer _(and logging the total duration)_
	 */
	time(label: string): Time {
		return new Time(label);
	}
}

class Time {
	private declare readonly state: TimeState;

	constructor(label: string) {
		this.state = {
			label,
			started: enabled,
			stopped: false,
		};

		if (this.state.started) {
			console.time(label);
		}
	}

	/**
	 * - Log the current duration of the timer
	 * - _(Ignored if logging is disabled)_
	 */
	log(): void {
		if (this.state.started && !this.state.stopped && enabled) {
			console.timeLog(this.state.label);
		}
	}

	/**
	 * - Stop the timer and logs the total duration
	 * - _(Will always log the total duration, even if logging is disabled)_
	 */
	stop(): void {
		if (this.state.started && !this.state.stopped) {
			this.state.stopped = true;

			console.timeEnd(this.state.label);
		}
	}
}

type TimeState = {
	label: string;
	started: boolean;
	stopped: boolean;
};

const logger = new Logger();

export {logger};
