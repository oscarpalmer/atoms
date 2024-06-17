declare global {
    var _atomic_logging: boolean;
}
type Logger = {
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
     * Logs any number of values at the "log" log level
     */
    log(data: unknown): void;
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
declare const logger: Logger;
export { logger };
