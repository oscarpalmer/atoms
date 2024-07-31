import {noop} from './function';

declare global {
	var _atomic_logging: boolean;
}

if (globalThis._atomic_logging == null) {
	globalThis._atomic_logging = true;
}

class Logger {
	/**
	 * Logs any number of values at the "debug" log level
	 */
	get debug() {
		return this.enabled ? console.debug : noop;
	}

	/**
	 * Logs the value and shows all its properties
	 */
	get dir() {
		return this.enabled ? console.dir : noop;
	}

	/**
	 * Is logging to the console enabled? _(defaults to `true`)_
	 */
	get enabled() {
		return globalThis._atomic_logging ?? true;
	}

	/**
	 * Enable or disable logging to the console
	 */
	set enabled(value: boolean) {
		globalThis._atomic_logging = value;
	}

	/**
	 * Logs any number of values at the "error" log level
	 */
	get error() {
		return this.enabled ? console.error : noop;
	}

	/**
	 * Logs any number of values at the "info" log level
	 */
	get info() {
		return this.enabled ? console.info : noop;
	}

	/**
	 * Logs any number of values at the "log" log level
	 */
	get log() {
		return this.enabled ? console.log : noop;
	}

	/**
	 * Logs data as a table, with optional properties to use as columns
	 */
	get table() {
		return this.enabled ? console.table : noop;
	}

	/**
	 * Logs any number of values together with a trace from where it was called
	 */
	get trace() {
		return this.enabled ? console.trace : noop;
	}

	/**
	 * Logs any number of values at the "warn" log level
	 */
	get warn() {
		return this.enabled ? console.warn : noop;
	}

	/**
	 * - Starts a logged timer with a label
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
			started: globalThis._atomic_logging ?? true,
			stopped: false,
		};

		if (this.state.started) {
			console.time(label);
		}
	}

	/**
	 * - Logs the current duration of the timer
	 * - Ignored if logging is disabled
	 */
	log(): void {
		if (this.state.started && !this.state.stopped && logger.enabled) {
			console.timeLog(this.state.label);
		}
	}

	/**
	 * - Stops the timer and logs the total duration
	 * - Will always log the total duration, even if logging is disabled
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
