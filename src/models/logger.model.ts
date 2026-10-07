// #region Types

export type InternalTimeLogger = {
	[LOGGER_SYMBOL]: TimeLoggerState;
} & TimeLogger;

export type Lumberjack = {
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
export type TimeLogger = {
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

export type TimeLoggerState = {
	isActive(): boolean;
	label: string;
	started: boolean;
	stopped: boolean;
};

// #endregion

// #region Variables

export const LOGGER_NAME = 'Logger';

export const LOGGER_NAME_TIMED = 'TimedLogger';

export const LOGGER_PROPERTY = '$logger';

export const LOGGER_SYMBOL: unique symbol = Symbol(LOGGER_PROPERTY);

// #endregion
