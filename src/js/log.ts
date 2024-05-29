/**
 * Logs any number of values at the "log" log level
 */
type LogCallback = (...data: unknown[]) => void;

type LogPrototype = {
	/**
	 * Is logging to the console enabled? _(defaults to `true`)_
	 */
	enabled: boolean;
	/**
	 * Logs the value and shows all its properties
	 */
	dir(value: unknown): void;
	/**
	 * Logs any number of values at the "debug" log level
	 */
	debug(...data: unknown[]): void;
	/**
	 * Logs any number of values at the "error" log level
	 */
	error(...data: unknown[]): void;
	/**
	 * Logs any number of values at the "info" log level
	 */
	info(...data: unknown[]): void;
	/**
	 * Logs data as a table, with optional properties to use as columns
	 */
	table(data: unknown, properties?: string[]): void;
	/**
	 * - Starts a logged timer with a label
	 * - Returns a `Time`-object for logging the current duration of the timer and stopping the timer _(and logging the total duration)_
	 */
	time(label: string): Time;
	/**
	 * Logs any number of values together with a trace from where it was called
	 */
	trace(...data: unknown[]): void;
	/**
	 * Logs any number of values at the "warn" log level
	 */
	warn(...data: unknown[]): void;
};

type Time = {
	/**
	 * - Logs the current duration of the timer
	 * - Ignored if logging is disabled
	 */
	log(): void;
	/**
	 * - Stops the timer and logs the total duration
	 * - Will always log the total duration, even if logging is disabled
	 */
	stop(): void;
};

type Type =
	| 'dir'
	| 'debug'
	| 'error'
	| 'info'
	| 'log'
	| 'table'
	| 'trace'
	| 'warn';

const types = new Set<Type>([
	'dir',
	'debug',
	'error',
	'info',
	'table',
	'trace',
	'warn',
]);

const log = (() => {
	let enabled = true;

	function instance(...data: unknown[]): void {
		work('log', data);
	}

	Object.defineProperties(instance, {
		enabled: {
			get() {
				return enabled;
			},
			set(value: boolean) {
				enabled = value;
			},
		},
		time: {
			value: time,
		},
	});

	for (const type of types) {
		Object.defineProperty(instance, type, {
			value: (...data: unknown[]) => work(type, data),
		});
	}

	return instance;
})() as LogCallback & LogPrototype;

function time(label: string): Time {
	const started = log.enabled;

	let stopped = false;

	if (started) {
		console.time(label);
	}

	return Object.create({
		log() {
			if (started && log.enabled) {
				console.timeLog(label);
			}
		},
		stop() {
			if (started && !stopped) {
				stopped = true;

				console.timeEnd(label);
			}
		},
	});
}

function work(type: Type, data: unknown[]): void {
	if (log.enabled) {
		console[type](...data);
	}
}

export {log};
