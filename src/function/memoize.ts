import {isPlainObject} from '../internal/is';
import {getString, join} from '../internal/string';
import type {GenericCallback} from '../models';
import {SizedMap} from '../sized/map';

// #region Types

class Memoized<Callback extends GenericCallback> {
	readonly #state: MemoizedState<Callback>;

	/**
	 * Maximum cache size
	 */
	get maximum(): number {
		return this.#state.cache?.maximum ?? Number.NaN;
	}

	/**
	 * Current cache size
	 */
	get size(): number {
		return this.#state.cache?.size ?? Number.NaN;
	}

	constructor(callback: Callback, options: Options) {
		const cache = new SizedMap<unknown, ReturnType<Callback>>(options.cacheSize);

		const getter = (...parameters: Parameters<Callback>): ReturnType<Callback> => {
			const key =
				options.cacheKey?.(...parameters) ??
				(parameters.length === 1 ? parameters[0] : join(parameters.map(getString), '_'));

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
	 * @param key Key to delete
	 * @returns `true` if the key existed and was removed, otherwise `false`
	 */
	delete(key: unknown): boolean {
		return this.#state.cache?.delete(key) ?? false;
	}

	/**
	 * Destroy the instance _(clearing its cache and removing its callback)_
	 */
	destroy(): void {
		this.#state.cache?.clear();

		this.#state.cache = undefined;
		this.#state.getter = undefined;
	}

	/**
	 * Get a result from the cache
	 * @param key Key to get
	 * @returns The cached result or `undefined` if it does not exist
	 */
	get(key: unknown): ReturnType<Callback> | undefined {
		return this.#state.cache?.get(key);
	}

	/**
	 * Does the result exist?
	 * @param key Key to check
	 * @returns `true` if the result exists, otherwise `false`
	 */
	has(key: unknown): boolean {
		return this.#state.cache?.has(key) ?? false;
	}

	/**
	 * Run the callback with the provided parameters
	 * @param parameters Parameters to pass to the callback
	 * @returns Cached or computed _(then cached)_ result
	 */
	run(...parameters: Parameters<Callback>): ReturnType<Callback> {
		if (this.#state.cache == null || this.#state.getter == null) {
			throw new Error('The Memoized instance has been destroyed');
		}

		return this.#state.getter(...parameters);
	}
}

/**
 * Options for memoized functions
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
 * @param callback Callback to memoize
 * @param options Memoization options
 * @returns Memoized instance
 */
export function memoize<Callback extends GenericCallback>(
	callback: Callback,
	options?: MemoizedOptions<Callback>,
): Memoized<Callback> {
	return new Memoized(callback, getMemoizationOptions(options));
}

// #endregion

// #region Variables

const DEFAULT_CACHE_SIZE = 1024;

// #endregion

// #region Exports

export type {Memoized, MemoizedOptions};

// #endregion
