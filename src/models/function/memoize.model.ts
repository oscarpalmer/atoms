import type {SizedMap} from '../../internal/sized/map';
import type {GenericCallback} from '../index';

// #region Types

export type InternalMemoized = {
	[MEMOIZED_SYMBOL]: MemoizedState;
} & Memoized<GenericCallback>;

/**
 * A _Memoized_ function instance, caching and retrieving results based on the its parameters _(or a custom cache key)_
 */
export type Memoized<Callback extends GenericCallback> = {
	/**
	 * Maximum cache size
	 *
	 * @returns Maximum cache size _(or `Number.NaN` if the instance has been destroyed)_
	 */
	get maximum(): number;

	/**
	 * Current cache size
	 *
	 * @returns Current cache size _(or `Number.NaN` if the instance has been destroyed)_
	 */
	get size(): number;

	/**
	 * Clear the cache
	 */
	clear(): void;

	/**
	 * Delete a result from the cache
	 *
	 * @param key Key to delete
	 * @returns `true` if the key existed and was removed, otherwise `false`
	 */
	delete(key: unknown): boolean;

	/**
	 * Destroy the instance
	 *
	 * _(When a Memoized instance is destroyed, its cache and callback are removed, and calls to `run` will throw an error)_
	 */
	destroy(): void;

	/**
	 * Get a result from the cache
	 *
	 * @param key Key to get
	 * @returns Cached result or `undefined` if it does not exist
	 */
	get(key: unknown): ReturnType<Callback> | undefined;

	/**
	 * Does the result exist?
	 *
	 * @param key Key to check
	 * @returns `true` if the result exists, otherwise `false`
	 */
	has(key: unknown): boolean;

	/**
	 * Run the callback with the provided parameters
	 *
	 * @param parameters Parameters to pass to the callback
	 * @returns Cached or computed _(then cached)_ result
	 */
	run(...parameters: Parameters<Callback>): ReturnType<Callback>;
};

/**
 * Options for a _Memoized_ function
 */
export type MemoizedOptions<Callback extends GenericCallback> = {
	/**
	 * Callback for getting a cache key for the provided parameters
	 */
	cacheKey?: (...parameters: Parameters<Callback>) => unknown;
	/**
	 * Size of the cache
	 */
	cacheSize?: number;
};

export type MemoizedState = {
	cache: SizedMap<unknown, unknown>;
	getter: GenericCallback;
	options: MemoizedStateOptions;
};

export type MemoizedStateOptions = {
	cacheKey?: GenericCallback;
	cacheSize: number;
};

// #endregion

// #region Variables

export const MEMOIZED_CACHE_SIZE_DEFAULT = 1024;

export const MEMOIZED_CALLBACK = 'Memoized requires a callback function';

export const MEMOIZED_KEY_SEPARATOR = '_';

export const MEMOIZED_SYMBOL: unique symbol = Symbol('memoized');

// #endregion
