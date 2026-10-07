import {noop} from './internal/function/misc';
import {getString} from './internal/string/misc';
import type {GenericCallback} from './models';
import {
	type InternalTimeLogger,
	type Lumberjack,
	type TimeLogger,
	LOGGER_NAME,
	LOGGER_NAME_TIMED,
	LOGGER_PROPERTY,
	LOGGER_SYMBOL,
} from './models/logger.model';

// #region Instances

function Lumberjack(this: any): void {}

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

function TimeLogger(this: any, label: string): void {
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

function isLogger(value: unknown): value is Lumberjack {
	return isLoggerInstance<Lumberjack>(LOGGER_NAME, value);
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

/**
 * A logger that can be used to log messages to the console
 *
 * _(Logging can be enabled or disabled by setting the `enabled` property)_
 */
// @ts-expect-error All good, no worries :-)
const Logger = new Lumberjack() as Lumberjack;

let enabled = true;

// #endregion

// #region Exports

export {isLogger, isTimeLogger, Logger, type TimeLogger};

// #endregion
