/**
 * Callback that runs after the timer has finished (or is stopped)
 * - `finished` is `true` if the timer was allowed to finish, and `false` if it was stopped
 */
type AfterCallback = (finished: boolean) => void;
/**
 * Callback that runs for each iteration of the timer
 */
type IndexedCallback = (index: number) => void;
type BaseOptions = {
    /**
     * Interval between each callback
     */
    interval: number;
    /**
     * Maximum amount of time the timer may run for
     */
    timeout: number;
};
type OptionsWithCount = {
    /**
     * How many times the timer should repeat
     */
    count: number;
} & BaseOptions;
type OptionsWithError = {
    /**
     * Callback to run when an error occurs _(usually a timeout)_
     */
    errorCallback?: () => void;
};
type RepeatOptions = {
    /**
     * Callback to run after the timer has finished (or is stopped)
     * - `finished` is `true` if the timer was allowed to finish, and `false` if it was stopped
     */
    afterCallback?: AfterCallback;
} & OptionsWithCount & OptionsWithError;
/**
 * A timer that can be started, stopped, and restarted as neeeded
 */
export type Timer = {
    /**
     * Is the timer running?
     */
    get active(): boolean;
    /**
     * Restarts the timer
     */
    restart(): Timer;
    /**
     * Starts the timer
     */
    start(): Timer;
    /**
     * Stops the timer
     */
    stop(): Timer;
};
type WaitOptions = {} & BaseOptions & OptionsWithError;
export type When = {
    /**
     * Stops the timer
     */
    stop(): void;
    then(resolve?: (() => void) | null, reject?: (() => void) | null): Promise<void>;
};
type WhenOptions = {} & OptionsWithCount;
/**
 * Is the value a repeating timer?
 */
export declare function isRepeated(value: unknown): value is Timer;
/**
 * Is the value a timer?
 */
export declare function isTimer(value: unknown): value is Timer;
/**
 * Is the value a waiting timer?
 */
export declare function isWaited(value: unknown): value is Timer;
/**
 * Is the value a conditional timer?
 */
export declare function isWhen(value: unknown): value is When;
/**
 * Creates a timer which:
 * - calls a callback after a certain amount of time...
 * - ... and repeats it a certain amount of times
 * ---
 * - `options.count` defaults to `Infinity` _(minimum `1`)_
 * - `options.interval` defaults to `0`
 * - `options.timeout` defaults to `30_000` _(30 seconds)_
 */
export declare function repeat(callback: IndexedCallback, options?: Partial<RepeatOptions>): Timer;
/**
 * Creates a timer which calls a callback after a certain amount of time
 */
export declare function wait(callback: () => void): Timer;
/**
 * Creates a timer which calls a callback after a certain amount of time
 */
export declare function wait(callback: () => void, time: number): Timer;
/**
 * Creates a timer which calls a callback after a certain amount of time
 * - `options.interval` defaults to `0`
 * - `options.timeout` defaults to `30_000` _(30 seconds)_
 */
export declare function wait(callback: () => void, options: Partial<WaitOptions>): Timer;
/**
 * - Creates a promise that resolves when a condition is met
 * - If the condition is never met in a timely manner, the promise will reject
 */
export declare function when(condition: () => boolean, options?: Partial<WhenOptions>): When;
export {};
