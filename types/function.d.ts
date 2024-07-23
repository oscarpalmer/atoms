import type { GenericCallback } from './models';
type Debounced<Callback extends GenericCallback> = Callback & {
    /**
     * Cancels the debounce
     */
    cancel: () => void;
};
type Memoised<Callback extends GenericCallback> = {
    readonly cache: Map<Parameters<Callback>[0], ReturnType<Callback>>;
    /**
     * Clears the cache
     */
    clear: () => void;
    /**
     * Deletes a result from the cache
     */
    delete: (key: Parameters<Callback>[0]) => boolean;
    /**
     * Retrieves the result from the cache if it exists, or `undefined` otherwise
     */
    get: (key: Parameters<Callback>[0]) => ReturnType<Callback> | undefined;
    /**
     * Checks if the cache has a result for a given key
     */
    has: (key: Parameters<Callback>[0]) => boolean;
    /**
     * Retrieves the result from the cache if it exists, otherwise runs the callback, caches the result, and returns it
     */
    run(...parameters: Parameters<Callback>): ReturnType<Callback>;
};
/**
 * - Debounces a function, ensuring it is only called after `time` milliseconds have passed
 * - On subsequent calls, the timer is reset and will wait another `time` milliseconds _(and so on...)_
 * - Time is clamped between _0_ and _1000_ milliseconds
 * - Returns the callback with an added `cancel`-method for manually cancelling the debounce
 */
export declare function debounce<Callback extends GenericCallback>(callback: Callback, time?: number): Debounced<Callback>;
/**
 * Memoises a function, caching and retrieving results based on the first parameter
 */
export declare function memoise<Callback extends GenericCallback>(callback: Callback): Memoised<Callback>;
/**
 * A function that does nothing, which can be useful, I guess…
 */
export declare function noop(): void;
/**
 * - Throttles a function, ensuring it is only called once every `time` milliseconds
 * - Time is clamped between _0_ and _1000_ milliseconds
 */
export declare function throttle<Callback extends GenericCallback>(callback: Callback, time?: number): Callback;
export {};
