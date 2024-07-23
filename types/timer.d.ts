declare global {
    var _atomic_timer_debug: boolean | undefined;
    var _atomic_timers: Timer[] | undefined;
}
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
type BaseTimer = {
    /**
     * Is the timer running?
     */
    get active(): boolean;
    /**
     * Is the timer paused?
     */
    get paused(): boolean;
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
     * Continues the timer _(if it was paused)_
     */
    continue(): Timer;
    /**
     * Pauses the timer _(if it was running)_
     */
    pause(): Timer;
    /**
     * Restarts the timer _(if it was running)_
     */
    restart(): Timer;
    /**
     * Starts the timer _(if it was stopped)_
     */
    start(): Timer;
    /**
     * Stops the timer _(if it was running)_
     */
    stop(): Timer;
} & BaseTimer;
type WaitOptions = {} & BaseOptions & OptionsWithError;
export type When = {
    /**
     * Continues the timer _(if it was paused)_
     */
    continue(): Timer;
    /**
     * Pauses the timer _(if it was running)_
     */
    pause(): Timer;
    /**
     * Stops the timer _(if it was running)_
     */
    stop(): Timer;
    /**
     * Starts the timer and returns a promise that resolves when the condition is met
     */
    then(resolve?: (() => void) | null, reject?: (() => void) | null): Promise<void>;
} & BaseTimer;
type WhenOptions = {} & OptionsWithCount;
/**
 * Creates a delayed promise that resolves after a certain amount of time _(or rejects when timed out)_
 */
export declare function delay(time: number, timeout?: number): Promise<void>;
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
 * - `options.count` defaults to `Infinity`
 * - `options.interval` defaults to `1000/60` _(1 frame)_
 * - `options.timeout` defaults to `Infinity`
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
 * - `options.interval` defaults to `1000/60` _(1 frame)_
 * - `options.timeout` defaults to `30_000` _(30 seconds)_
 */
export declare function wait(callback: () => void, options: Partial<WaitOptions>): Timer;
/**
 * - Creates a promise that resolves when a condition is met
 * - If the condition is never met in a timely manner, the promise will reject
 */
export declare function when(condition: () => boolean, options?: Partial<WhenOptions>): When;
export {};
