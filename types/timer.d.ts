/**
 * Callback that runs after the timer has finished (or is stopped)
 * - `finished` is `true` if the timer was allowed to finish, and `false` if it was stopped
 */
type AfterCallback = (finished: boolean) => void;
type Options = {
    /**
     * Callback to run after the timer has finished (or is stopped)
     * - `finished` is `true` if the timer was allowed to finish, and `false` if it was stopped
     */
    afterCallback?: AfterCallback;
    /**
     * How many times the timer should repeat
     */
    count?: number;
    /**
     * Interval between each callback
     */
    interval?: number;
};
type Timer = {
    /**
     * Is the timer running?
     */
    get active(): boolean;
    /**
     * Restarts the timer
     */
    restart: () => Timer;
    /**
     * Starts the timer
     */
    start: () => Timer;
    /**
     * Stops the timer
     */
    stop: () => Timer;
};
/**
 * - Creates a timer which calls a callback after a certain amount of time, and repeats it a certain amount of times, with an optional callback after it's finished (or stopped)
 * - `options.count` defaults to `Infinity`
 * - `options.time` defaults to `0`
 * - `options.afterCallback` defaults to `undefined`
 */
export declare function repeat(callback: (index: number) => void, options?: Options): Timer;
/**
 * - Creates a timer which calls a callback after a certain amount of time
 * - `time` defaults to `0`
 */
export declare function wait(callback: () => void, time?: number): Timer;
export {};
