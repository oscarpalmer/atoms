import type {GenericCallback} from '../../models';
import {
	type InternalMemoized,
	MEMOIZED_CACHE_SIZE_DEFAULT,
	MEMOIZED_CALLBACK,
	MEMOIZED_KEY_SEPARATOR,
	MEMOIZED_SYMBOL,
	type Memoized,
	type MemoizedOptions,
	type MemoizedState,
	type MemoizedStateOptions,
} from '../../models/function/memoize.model';
import {getNumberOrDefault} from '../defaults';
import {isPlainObject} from '../is';
import {SizedMap} from '../sized/map';
import {getString, join} from '../string/misc';

// #region Instances

function Memoized(this: any, callback: GenericCallback, options: MemoizedStateOptions): void {
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
	this[MEMOIZED_SYMBOL].cache.clear();
}

function deleteMemoizedValue(this: InternalMemoized, key: unknown): boolean {
	return this[MEMOIZED_SYMBOL].cache.delete(key);
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
): MemoizedStateOptions {
	const {cacheKey, cacheSize} = isPlainObject(input) ? input : {};

	return {
		cacheKey: typeof cacheKey === 'function' ? cacheKey : undefined,
		cacheSize: getNumberOrDefault(cacheSize, MEMOIZED_CACHE_SIZE_DEFAULT),
	};
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
		throw new TypeError(MEMOIZED_CALLBACK);
	}

	// @ts-expect-error All good, no worries :-)
	return new Memoized(callback, createMemoizationOptions(options));
}

function runMemoized(this: InternalMemoized, ...parameters: Parameters<GenericCallback>): unknown {
	return this[MEMOIZED_SYMBOL].getter(...parameters);
}

// #endregion

// #region Exports

export type {Memoized, MemoizedOptions};

// #endregion
