import {isPlainObject} from '../internal/is';
import {getString, join} from '../internal/string';
import type {GenericCallback} from '../models';
import {SizedMap} from '../sized/map';

// #region Types

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

type MemoizedState = {
	cache: SizedMap<unknown, unknown>;
	getter: GenericCallback;
	options: Options;
};

type Options = {
	cacheKey?: GenericCallback;
	cacheSize: number;
};

// #endregion

// #region Functions

function getMemoizationOptions<Callback extends GenericCallback>(
	input?: MemoizedOptions<Callback>,
): Options {
	const {cacheKey, cacheSize} = isPlainObject(input) ? (input as MemoizedOptions<Callback>) : {};

	return {
		cacheKey: typeof cacheKey === 'function' ? cacheKey : undefined,
		cacheSize:
			typeof cacheSize === 'number' && cacheSize > 0 ? cacheSize : MEMOIZED_CACHE_SIZE_DEFAULT,
	};
}

/**
 * Memoize a function, caching and retrieving results based on the first parameter
 *
 * @param callback Callback to memoize
 * @param options Memoization options
 * @returns _Memoized_ instance
 */
export function memoize<Callback extends GenericCallback>(
	callback: Callback,
	options?: MemoizedOptions<Callback>,
): Memoized<Callback> {
	if (typeof callback !== 'function') {
		throw new TypeError(MEMOIZED_CALLBACK);
	}

	const state: MemoizedState = {
		cache: undefined as never,
		getter: undefined as never,
		options: getMemoizationOptions(options),
	};

	state.cache = new SizedMap(state.options.cacheSize);

	state.getter = (...parameters: never[]) => {
		const key =
			state.options.cacheKey?.(...parameters) ??
			(parameters.length === 1
				? parameters[0]
				: join(parameters.map(getString), MEMOIZED_KEY_SEPARATOR));

		if (state.cache!.has(key)) {
			return state.cache!.get(key) as ReturnType<Callback>;
		}

		const value = callback(...parameters);

		state.cache.set(key, value);

		return value;
	};

	const instance: unknown = {
		clear: () => state.cache.clear(),
		delete: (key: never) => state.cache.delete(key),
		get: (key: never) => state.cache.get(key),
		has: (key: never) => state.cache.has(key),
		run: (...parameters: Parameters<Callback>) => state.getter(...parameters),
	};

	Object.defineProperties(instance, {
		maximum: {
			enumerable: true,
			get: () => state.cache.maximum,
		},
		size: {
			enumerable: true,
			get: () => state.cache.size,
		},
	});

	return Object.freeze(instance) as Memoized<Callback>;
}

// #endregion

// #region Variables

const MEMOIZED_CACHE_SIZE_DEFAULT = 1024;

const MEMOIZED_CALLBACK = 'Memoized requires a callback function';

const MEMOIZED_KEY_SEPARATOR = '_';

// #endregion
