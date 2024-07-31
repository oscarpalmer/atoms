declare global {
    var _atomic_logging: boolean;
}
declare class Logger {
    /**
     * Logs any number of values at the "debug" log level
     */
    get debug(): {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
        (...data: any[]): void;
    };
    /**
     * Logs the value and shows all its properties
     */
    get dir(): {
        (item?: any, options?: any): void;
        (obj: any, options?: import("util").InspectOptions): void;
        (item?: any, options?: any): void;
    };
    /**
     * Is logging to the console enabled? _(defaults to `true`)_
     */
    get enabled(): boolean;
    /**
     * Enable or disable logging to the console
     */
    set enabled(value: boolean);
    /**
     * Logs any number of values at the "error" log level
     */
    get error(): {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
        (...data: any[]): void;
    };
    /**
     * Logs any number of values at the "info" log level
     */
    get info(): {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
        (...data: any[]): void;
    };
    /**
     * Logs any number of values at the "log" log level
     */
    get log(): {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
        (...data: any[]): void;
    };
    /**
     * Logs data as a table, with optional properties to use as columns
     */
    get table(): {
        (tabularData?: any, properties?: string[]): void;
        (tabularData: any, properties?: readonly string[]): void;
        (tabularData?: any, properties?: string[]): void;
    };
    /**
     * Logs any number of values together with a trace from where it was called
     */
    get trace(): {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
        (...data: any[]): void;
    };
    /**
     * Logs any number of values at the "warn" log level
     */
    get warn(): {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
        (...data: any[]): void;
    };
    /**
     * - Starts a logged timer with a label
     * - Returns a `Time`-object for logging the current duration of the timer and stopping the timer _(and logging the total duration)_
     */
    time(label: string): Time;
}
declare class Time {
    private readonly state;
    constructor(label: string);
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
}
declare const logger: Logger;
export { logger };
