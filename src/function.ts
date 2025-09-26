import {milliseconds} from './internal/function';
import {getString, join} from './internal/string';
import type {GenericCallback} from './models';
import {SizedMap} from './sized';

type CancellableCallback<Callback extends GenericCallback> = Callback & {
	/**
	 * Cancel the callback
	 */
	cancel: () => void;
};

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

	constructor(callback: Callback, size: number) {
		const cache = new SizedMap<unknown, ReturnType<Callback>>(size);

		const getter = (
			...parameters: Parameters<Callback>
		): ReturnType<Callback> => {
			const key =
				parameters.length === 1
					? parameters[0]
					: join(parameters.map(getString), '_');

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
	 * @returns `true` if the key existed and was removed, `false` otherwise
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
	 * @returns `true` if the result exists, `false` otherwise
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
			/* istanbul ignore next */
			throw new Error('The Memoized instance has been destroyed');
		}

		return this.#state.getter(...parameters);
	}
}

type MemoizedState<Callback extends GenericCallback> = {
	cache?: SizedMap<unknown, ReturnType<Callback>>;
	getter?: (...parameters: Parameters<Callback>) => ReturnType<Callback>;
};

/**
 * - Debounce a function, ensuring it is only called after `time` milliseconds have passed
 * - On subsequent calls, the timer is reset and will wait another `time` milliseconds _(and so on...)_
 * @param callback Callback to debounce
 * @param time Time in milliseconds to wait before calling the callback _(defaults to match frame rate)_
 * @returns Debounced callback with a `cancel` method
 */
export function debounce<Callback extends GenericCallback>(
	callback: Callback,
	time?: number,
): CancellableCallback<Callback> {
	const interval =
		typeof time === 'number' && time >= milliseconds ? time : milliseconds;

	function step(
		now: DOMHighResTimeStamp,
		parameters: Parameters<Callback>,
	): void {
		if (interval === milliseconds || now - start >= interval) {
			callback(...parameters);
		} else {
			frame = requestAnimationFrame(next => {
				step(next, parameters);
			});
		}
	}

	let frame: DOMHighResTimeStamp | undefined;
	let start: DOMHighResTimeStamp;

	const debounced = (...parameters: Parameters<Callback>): void => {
		debounced.cancel();

		frame = requestAnimationFrame(now => {
			start = now - milliseconds;

			step(now, parameters);
		});
	};

	debounced.cancel = (): void => {
		if (frame != null) {
			cancelAnimationFrame(frame);

			frame = undefined;
		}
	};

	return debounced as CancellableCallback<Callback>;
}

/**
 * Memoize a function, caching and retrieving results based on the first parameter
 * @param callback Callback to memoize
 * @param cacheSize Size of the cache
 * @returns Memoized instance
 */
export function memoize<Callback extends GenericCallback>(
	callback: Callback,
	cacheSize?: number,
): Memoized<Callback> {
	return new Memoized(
		callback,
		typeof cacheSize === 'number' && cacheSize > 0
			? cacheSize
			: DEFAULT_CACHE_SIZE,
	);
}

/**
 * Throttle a function, ensuring it is only called once every `time` milliseconds
 * @param callback Callback to throttle
 * @param time Time in milliseconds to wait before calling the callback again _(defaults to match frame rate)_
 * @returns Throttled callback with a `cancel` method
 */
export function throttle<Callback extends GenericCallback>(
	callback: Callback,
	time?: number,
): CancellableCallback<Callback> {
	const interval =
		typeof time === 'number' && time >= milliseconds ? time : milliseconds;

	function step(
		now: DOMHighResTimeStamp,
		parameters: Parameters<Callback>,
	): void {
		if (interval === milliseconds || now - last >= interval) {
			last = now;

			callback(...parameters);
		} else {
			frame = requestAnimationFrame(next => {
				step(next, parameters);
			});
		}
	}

	let last: number;

	let frame: DOMHighResTimeStamp | undefined;

	const throttler = (...parameters: Parameters<Callback>): void => {
		throttler.cancel();

		frame = requestAnimationFrame(now => {
			last ??= now - milliseconds;

			step(now, parameters);
		});
	};

	throttler.cancel = (): void => {
		if (frame != null) {
			cancelAnimationFrame(frame);

			frame = undefined;
		}
	};

	return throttler as CancellableCallback<Callback>;
}

export type {CancellableCallback, GenericCallback, Memoized};
export {noop} from './internal/function';

//

const DEFAULT_CACHE_SIZE = 65_536;
