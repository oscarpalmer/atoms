import {isPlainObject} from '../internal/is';
import {getString, join} from '../internal/string';
import type {GenericCallback} from '../models';
import {SizedMap} from '../sized/map';

// #region Types

/**
 * A _Memoized_ function instance, caching and retrieving results based on the its parameters _(or a custom cache key)_
 */
class Memoized<Callback extends GenericCallback> {
	readonly #state: MemoizedState<Callback>;

	/**
	 * Maximum cache size
	 *
	 * @returns Maximum cache size _(or `Number.NaN` if the instance has been destroyed)_
	 */
	get maximum(): number {
		return this.#state.cache?.maximum ?? Number.NaN;
	}

	/**
	 * Current cache size
	 *
	 * @returns Current cache size _(or `Number.NaN` if the instance has been destroyed)_
	 */
	get size(): number {
		return this.#state.cache?.size ?? Number.NaN;
	}

	constructor(callback: Callback, options: Options) {
		const cache = new SizedMap<unknown, ReturnType<Callback>>(options.cacheSize);

		const getter = (...parameters: Parameters<Callback>): ReturnType<Callback> => {
			const key =
				options.cacheKey?.(...parameters) ??
				(parameters.length === 1 ? parameters[0] : join(parameters.map(getString), SEPARATOR));

			if (cache.has(key)) {
				return cache.get(key) as ReturnType<Callback>;
			}

			const value = callback(...parameters);

			cache.set(key, value);

			return value;
		};

		this.#state = {cache, getter};
	}

	/**
	 * Clear the cache
	 */
	clear(): void {
		this.#state.cache?.clear();
	}

	/**
	 * Delete a result from the cache
	 *
	 * @param key Key to delete
	 * @returns `true` if the key existed and was removed, otherwise `false`
	 */
	delete(key: unknown): boolean {
		return this.#state.cache?.delete(key) ?? false;
	}

	/**
	 * Destroy the instance
	 *
	 * _(When a Memoized instance is destroyed, its cache and callback are removed, and calls to `run` will throw an error)_
	 */
	destroy(): void {
		this.#state.cache?.clear();

		this.#state.cache = undefined;
		this.#state.getter = undefined;
	}

	/**
	 * Get a result from the cache
	 *
	 * @param key Key to get
	 * @returns Cached result or `undefined` if it does not exist
	 */
	get(key: unknown): ReturnType<Callback> | undefined {
		return this.#state.cache?.get(key);
	}

	/**
	 * Does the result exist?
	 *
	 * @param key Key to check
	 * @returns `true` if the result exists, otherwise `false`
	 */
	has(key: unknown): boolean {
		return this.#state.cache?.has(key) ?? false;
	}

	/**
	 * Run the callback with the provided parameters
	 *
	 * @param parameters Parameters to pass to the callback
	 * @returns Cached or computed _(then cached)_ result
	 */
	run(...parameters: Parameters<Callback>): ReturnType<Callback> {
		if (this.#state.cache == null || this.#state.getter == null) {
			throw new Error(MEMOIZED_ERROR_DESTROYED);
		}

		return this.#state.getter(...parameters);
	}
}

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

	return new Memoized(callback, getMemoizationOptions(options));
}

// #endregion

// #region Variables

const DEFAULT_CACHE_SIZE = 1024;

const MEMOIZED_ERROR_CALLBACK = 'Memoized requires a callback function';

const MEMOIZED_ERROR_DESTROYED = 'The Memoized instance has been destroyed';

const SEPARATOR = '_';

// #endregion

// #region Exports

export type {Memoized, MemoizedOptions};

// #endregion
