import {noop} from './internal/function/misc';
import {getString} from './internal/string/misc';
import type {GenericCallback} from './models';

// #region Special variables

const LOGGER_NAME = 'Logger';

const LOGGER_NAME_TIMED = 'TimedLogger';

const LOGGER_PROPERTY = '$logger';

// #endregion

// #region Types

type InternalTimeLogger = {
	[LOGGER_SYMBOL]: TimeLoggerState;
} & TimeLogger;

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
	time(label: string): TimeLogger;
};

/**
 * A named timer that can be used to log durations to the console
 */
type TimeLogger = {
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

type TimeLoggerState = {
	isActive: () => boolean;
	label: string;
	started: boolean;
	stopped: boolean;
};

// #endregion

// #region Instances

function Lumberjack(this: any) {}

Lumberjack.prototype[LOGGER_PROPERTY] = LOGGER_NAME;

Lumberjack.prototype.time = getTimeLogger;

Object.defineProperties(Lumberjack.prototype, {
	debug: {
		get: getLoggerCallback.bind('debug'),
	},
	dir: {
		get: getLoggerCallback.bind('dir'),
	},
	error: {
		get: getLoggerCallback.bind('error'),
	},
	enabled: {
		enumerable: true,
		get: getLoggerEnabled,
		set: setLoggerEnabled,
	},
	info: {
		get: getLoggerCallback.bind('info'),
	},
	log: {
		get: getLoggerCallback.bind('log'),
	},
	table: {
		get: getLoggerCallback.bind('table'),
	},
	trace: {
		get: getLoggerCallback.bind('trace'),
	},
	warn: {
		get: getLoggerCallback.bind('warn'),
	},
});

function TimeLogger(this: any, label: string) {
	this[LOGGER_SYMBOL] = {
		label,
		started: enabled,
		stopped: false,
	};

	this[LOGGER_SYMBOL].isActive = (): boolean => {
		return enabled && this[LOGGER_SYMBOL].started && !this[LOGGER_SYMBOL].stopped;
	};

	if (this[LOGGER_SYMBOL].started) {
		console.time(label);
	}
}

TimeLogger.prototype[LOGGER_PROPERTY] = LOGGER_NAME_TIMED;

Object.defineProperties(TimeLogger.prototype, {
	active: {
		enumerable: true,
		get: getTimeLoggerActive,
	},
	log: {
		get: getTimerLoggerLog,
	},
	stop: {
		get: getTimeLoggerStop,
	},
});

// #endregion

// #region Functions

function getLoggerCallback(this: keyof typeof console): GenericCallback {
	return enabled ? console[this].bind(console) : noop;
}

function getLoggerEnabled(): boolean {
	return enabled;
}

function getTimeLogger(label: unknown): TimeLogger {
	// @ts-expect-error All good, no worries :-)
	return new TimeLogger(getString(label));
}

function getTimeLoggerActive(this: InternalTimeLogger): boolean {
	return this[LOGGER_SYMBOL].isActive();
}

function getTimerLoggerLog(this: InternalTimeLogger): GenericCallback {
	const state = this[LOGGER_SYMBOL];

	return state.isActive() ? console.timeLog.bind(console, state.label) : noop;
}

function getTimeLoggerStop(this: InternalTimeLogger): GenericCallback {
	const state = this[LOGGER_SYMBOL];

	if (state.isActive()) {
		state.stopped = true;

		return console.timeEnd.bind(console, state.label);
	}

	return noop;
}

function isLogger(value: unknown): value is Logger {
	return isLoggerInstance<Logger>(LOGGER_NAME, value);
}

function isLoggerInstance<Instance>(name: string, value: unknown): value is Instance {
	return (
		typeof value === 'object' &&
		value !== null &&
		LOGGER_PROPERTY in value &&
		value[LOGGER_PROPERTY] === name
	);
}

function isTimeLogger(value: unknown): value is TimeLogger {
	return isLoggerInstance<TimeLogger>(LOGGER_NAME_TIMED, value);
}

function setLoggerEnabled(value: unknown): void {
	enabled = typeof value === 'boolean' ? value : enabled;
}

// #endregion

// #region Variables

const LOGGER_SYMBOL = Symbol(LOGGER_PROPERTY);

/**
 * A logger that can be used to log messages to the console
 *
 * _(Logging can be enabled or disabled by setting the `enabled` property)_
 */
// @ts-expect-error All good, no worries :-)
const Logger = new Lumberjack() as Logger;

let enabled = true;

// #endregion

// #region Exports

export {isLogger, isTimeLogger, Logger, type TimeLogger};

// #endregion
