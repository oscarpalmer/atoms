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
type MemoizedOptions<Callback extends GenericCallback> = {
	/**
	 * Callback for getting a cache key for the provided parameters
	 */
	cacheKey?: (...parameters: Parameters<Callback>) => unknown;
	/**
	 * Size of the cache
	 */
	cacheSize?: number;
};

type MemoizedState<Callback extends GenericCallback> = {
	cache?: SizedMap<unknown, ReturnType<Callback>>;
	getter?: (...parameters: Parameters<Callback>) => ReturnType<Callback>;
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
		cacheSize: typeof cacheSize === 'number' && cacheSize > 0 ? cacheSize : DEFAULT_CACHE_SIZE,
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
		throw new TypeError(MEMOIZED_ERROR_CALLBACK);
	}

	const state: MemoizedState<Callback> = {
		options: getMemoizationOptions(options),
	};

	state.cache = new SizedMap<unknown, ReturnType<Callback>>(state.options.cacheSize);

	state.getter = (...parameters: Parameters<Callback>): ReturnType<Callback> => {
		const key =
			state.options.cacheKey?.(...parameters) ??
			(parameters.length === 1 ? parameters[0] : join(parameters.map(getString), SEPARATOR));

		if (state.cache!.has(key)) {
			return state.cache!.get(key) as ReturnType<Callback>;
		}

		const value = callback(...parameters);

		state.cache?.set(key, value);

		return value;
	};

	const instance = {
		clear: () => {
			state.cache?.clear();
		},
		delete: (key: unknown) => {
			return state.cache?.delete(key) ?? false;
		},
		destroy: () => {
			state.cache?.clear();

			state.cache = undefined;
			state.getter = undefined;
		},
		get: (key: unknown) => {
			return state.cache?.get(key);
		},
		has: (key: unknown) => {
			return state.cache?.has(key) ?? false;
		},
		run: (...parameters: Parameters<Callback>) => {
			if (state.cache == null || state.getter == null) {
				throw new Error(MEMOIZED_ERROR_DESTROYED);
			}

			return state.getter(...parameters);
		},
	};

	Object.defineProperties(instance, {
		maximum: {
			enumerable: true,
			get: () => state.cache?.maximum ?? Number.NaN,
		},
		size: {
			enumerable: true,
			get: () => state.cache?.size ?? Number.NaN,
		},
	});

	return Object.freeze(instance) as Memoized<Callback>;
}

// #endregion

// #region Variables

const DEFAULT_CACHE_SIZE = 1024;

const MEMOIZED_ERROR_CALLBACK = 'Memoized requires a callback function';

const MEMOIZED_ERROR_DESTROYED = 'The Memoized instance has been destroyed';

const SEPARATOR = '_';

// #endregion
