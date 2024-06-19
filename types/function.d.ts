import type { GenericCallback } from './models';
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
 * Memoises a function, caching and retrieving results based on the first parameter
 */
export declare function memoise<Callback extends GenericCallback>(callback: Callback): Memoised<Callback>;
/**
 * A function that does nothing, which can be useful, I guess…
 */
export declare function noop(): void;
export {};
