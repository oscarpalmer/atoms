import {noop} from './internal/function/misc';
import {getString} from './internal/string/misc';

// #region Types

type Logger = {
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
type TimedLogger = {
	/**
	 * Is the timer active? _(i.e. has it been started and not stopped, and is logging enabled?)_
	 */
	get active(): boolean;

	/**
	 * Log the current duration of the timer _(ignored if logging is disabled)_
	 */
	get log(): () => void;

	/**
	 * Stop the timer and logs the total duration
	 *
	 * _(Will always log the total duration, even if logging is disabled)_
	 */
	get stop(): () => void;
};

type TimeState = {
	label: string;
	started: boolean;
	stopped: boolean;
};

// #endregion

// #region Functions

function isLogger(value: unknown): value is Logger {
	return isLoggerInstance<Logger>(LOGGER_NAME, value);
}

function isLoggerInstance<Instance>(name: string, value: unknown): value is Instance {
	return (
		typeof value === 'object' &&
		value !== null &&
		(value as Record<string, unknown>)[LOGGER_PROPERTY] === name
	);
}

function isTimedLogger(value: unknown): value is TimedLogger {
	return isLoggerInstance<TimedLogger>(LOGGER_NAME_TIMED, value);
}

function timedLogger(label: string): TimedLogger {
	function stop() {
		const fn = stopper;

		state.stopped = true;

		logger = undefined as never;
		stopper = undefined as never;

		return fn;
	}

	let logger = console.timeLog.bind(console, label);
	let stopper = console.timeEnd.bind(console, label);

	const state: TimeState = {
		label,
		started: enabled,
		stopped: false,
	};

	const instance: unknown = {};

	Object.defineProperties(instance, {
		[LOGGER_PROPERTY]: {
			value: LOGGER_NAME_TIMED,
		},
		active: {
			enumerable: true,
			get: () => state.started && !state.stopped && enabled,
		},
		log: {
			get: () => ((instance as TimedLogger).active ? logger : noop),
		},
		stop: {
			get: () => ((instance as TimedLogger).active ? stop() : noop),
		},
	});

	if (state.started) {
		console.time(label);
	}

	return Object.freeze(instance) as TimedLogger;
}

// #endregion

// #region Variables

const LOGGER_NAME = 'Logger';

const LOGGER_NAME_TIMED = 'TimedLogger';

const LOGGER_PROPERTY = '$logger';

const methods = ['debug', 'dir', 'error', 'info', 'log', 'table', 'trace', 'warn'] as const;

/**
 * A logger that can be used to log messages to the console
 *
 * _(Logging can be enabled or disabled by setting the `enabled` property)_
 */
const Logger = (() => {
	const instance: unknown = {};

	Object.defineProperties(instance, {
		[LOGGER_PROPERTY]: {
			value: LOGGER_NAME,
		},
		enabled: {
			enumerable: true,
			get: () => enabled,
			set: (value: never) => {
				enabled = typeof value === 'boolean' ? value : enabled;
			},
		},
		time: {
			value: (label: never) => timedLogger(getString(label)),
		},
	});

	for (const method of methods) {
		Object.defineProperty(instance, method, {
			enumerable: true,
			get() {
				return enabled ? console[method].bind(console) : noop;
			},
		});
	}

	return Object.freeze(instance);
})() as Logger;

let enabled = true;

// #endregion

// #region Exports

export {isLogger, isTimedLogger, Logger, type TimedLogger};

// #endregion
