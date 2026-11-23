import {
	type InternalMemoized,
	MEMOIZED_CACHE_SIZE_DEFAULT,
	MEMOIZED_KEY_SEPARATOR,
	MEMOIZED_MESSAGE_CALLBACK,
	MEMOIZED_MESSAGE_PROMISE,
	MEMOIZED_SYMBOL,
	type Memoized,
	type MemoizedOptions,
	type MemoizedState,
	type MemoizedStateOptions,
} from '../../models/function/memoize.model';
import type {
	GenericAsyncCallback,
	GenericCallback,
	GenericSyncCallback,
} from '../../models/misc.model';
import {getNumberOrDefault} from '../defaults';
import {isAsyncFunction, isPlainObject, isThenable} from '../is';
import {swallow} from '../promise';
import {SizedMap} from '../sized/map';
import {getString, join} from '../string/misc';
import {noop} from './misc';

// #region Instances

function Memoized(
	this: InternalMemoized,
	callback: GenericCallback,
	options: MemoizedStateOptions,
): void {
	this[MEMOIZED_SYMBOL] = {
		options,
		cache: new SizedMap(options.cacheSize),
		getter: noop,
	};

	this[MEMOIZED_SYMBOL].getter = isAsyncFunction(callback)
		? createAsynchronousGetter(this[MEMOIZED_SYMBOL], callback)
		: createSynchronousGetter(this[MEMOIZED_SYMBOL], callback);
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
	this[MEMOIZED_SYMBOL].cache.clear();
}

function deleteMemoizedValue(this: InternalMemoized, key: unknown): boolean {
	return this[MEMOIZED_SYMBOL].cache.delete(key);
}

function createAsynchronousGetter(
	state: MemoizedState,
	callback: GenericAsyncCallback,
): GenericAsyncCallback {
	return async (...parameters: unknown[]) => {
		const key = getKey(state, parameters);

		if (state.cache.has(key)) {
			return state.cache.get(key);
		}

		const promise = callback(...parameters);

		state.cache.set(key, promise);

		// Evict on rejection, so failures are not sticky (and only if the entry is still this promise)
		promise.then(noop, () => {
			if (state.cache.get(key) === promise) {
				state.cache.delete(key);
			}
		});

		return promise;
	};
}

function createSynchronousGetter(
	state: MemoizedState,
	callback: GenericCallback,
): GenericSyncCallback {
	return (...parameters: unknown[]) => {
		const key = getKey(state, parameters);

		if (state.cache.has(key)) {
			return state.cache.get(key);
		}

		const value = callback(...parameters);

		if (isThenable(value)) {
			swallow(value);

			throw new Error(MEMOIZED_MESSAGE_PROMISE);
		}

		state.cache.set(key, value);

		return value;
	};
}

function createMemoizationOptions<Callback extends GenericCallback>(
	input?: MemoizedOptions<Callback>,
): MemoizedStateOptions {
	const {cacheKey, cacheSize} = isPlainObject(input) ? input : {};

	return {
		cacheKey: typeof cacheKey === 'function' ? cacheKey : undefined,
		cacheSize: getNumberOrDefault(cacheSize, MEMOIZED_CACHE_SIZE_DEFAULT),
	};
}

function getKey(state: MemoizedState, parameters: unknown[]): unknown {
	return (
		state.options.cacheKey?.(...parameters) ??
		(parameters.length === 1
			? parameters[0]
			: join(parameters.map(getString), MEMOIZED_KEY_SEPARATOR))
	);
}

function getMemoizedMaximum(this: InternalMemoized): number {
	return this[MEMOIZED_SYMBOL].cache.maximum;
}

function getMemoizedSize(this: InternalMemoized): number {
	return this[MEMOIZED_SYMBOL].cache.size;
}

function getMemoizedValue(this: InternalMemoized, key: unknown): unknown {
	return this[MEMOIZED_SYMBOL].cache.get(key);
}

function hasMemoizedValue(this: InternalMemoized, key: unknown): boolean {
	return this[MEMOIZED_SYMBOL].cache.has(key);
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
		throw new TypeError(MEMOIZED_MESSAGE_CALLBACK);
	}

	// @ts-expect-error Using old school function constructor, so all good, no worries :-)
	return new Memoized(callback, createMemoizationOptions(options));
}

function runMemoized(this: InternalMemoized, ...parameters: Parameters<GenericCallback>): unknown {
	return this[MEMOIZED_SYMBOL].getter(...parameters);
}

// #endregion

// #region Exports

export type {Memoized, MemoizedOptions};

// #endregion
