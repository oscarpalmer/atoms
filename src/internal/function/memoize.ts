import type {GenericCallback} from '../../models';
import {getNumberOrDefault} from '../defaults';
import {isPlainObject} from '../is';
import {SizedMap} from '../sized/map';
import {getString, join} from '../string/misc';

// #region Types

type InternalMemoized = {
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

// #region Instances

function Memoized(this: any, callback: GenericCallback, options: Options) {
	this[MEMOIZED_SYMBOL] = {
		options,
		cache: new SizedMap(options.cacheSize),
		getter: undefined,
	};

	this[MEMOIZED_SYMBOL].getter = createGetter(this[MEMOIZED_SYMBOL], callback);
}

Memoized.prototype.clear = clearMemoized;
Memoized.prototype.delete = deleteMemoizedValue;
Memoized.prototype.get = getMemoizedValue;
Memoized.prototype.has = hasMemoizedValue;
Memoized.prototype.run = runMemoized;

Object.defineProperties(Memoized.prototype, {
	maximum: {
		enumerable: true,
		get: getMemoizedMaximum,
	},
	size: {
		enumerable: true,
		get: getMemoizedSize,
	},
});

// #endregion

// #region Functions

function clearMemoized(this: InternalMemoized): void {
	(this[MEMOIZED_SYMBOL] as MemoizedState).cache.clear();
}

function deleteMemoizedValue(this: InternalMemoized, key: unknown): boolean {
	return (this[MEMOIZED_SYMBOL] as MemoizedState).cache.delete(key);
}

function createGetter(state: MemoizedState, callback: GenericCallback): GenericCallback {
	return (...parameters: unknown[]) => {
		const key =
			state.options.cacheKey?.(...parameters) ??
			(parameters.length === 1
				? parameters[0]
				: join(parameters.map(getString), MEMOIZED_KEY_SEPARATOR));

		if (state.cache.has(key)) {
			return state.cache.get(key);
		}

		const value = callback(...parameters);

		state.cache.set(key, value);

		return value;
	};
}

function createMemoizationOptions<Callback extends GenericCallback>(
	input?: MemoizedOptions<Callback>,
): Options {
	const {cacheKey, cacheSize} = isPlainObject(input) ? input : {};

	return {
		cacheKey: typeof cacheKey === 'function' ? cacheKey : undefined,
		cacheSize: getNumberOrDefault(cacheSize, MEMOIZED_CACHE_SIZE_DEFAULT),
	};
}

function getMemoizedMaximum(this: InternalMemoized): number {
	return (this[MEMOIZED_SYMBOL] as MemoizedState).cache.maximum;
}

function getMemoizedSize(this: InternalMemoized): number {
	return (this[MEMOIZED_SYMBOL] as MemoizedState).cache.size;
}

function getMemoizedValue(this: InternalMemoized, key: unknown): unknown {
	return (this[MEMOIZED_SYMBOL] as MemoizedState).cache.get(key);
}

function hasMemoizedValue(this: InternalMemoized, key: unknown): boolean {
	return (this[MEMOIZED_SYMBOL] as MemoizedState).cache.has(key);
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

	// @ts-expect-error All good, no worries :-)
	return new Memoized(callback, createMemoizationOptions(options));
}

function runMemoized(this: InternalMemoized, ...parameters: Parameters<GenericCallback>): unknown {
	return (this[MEMOIZED_SYMBOL] as MemoizedState).getter(...parameters);
}

// #endregion

// #region Variables

const MEMOIZED_CACHE_SIZE_DEFAULT = 1024;

const MEMOIZED_CALLBACK = 'Memoized requires a callback function';

const MEMOIZED_KEY_SEPARATOR = '_';

const MEMOIZED_SYMBOL = Symbol('memoized');

// #endregion
