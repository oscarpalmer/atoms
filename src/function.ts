import type {GenericCallback} from './models';
import {clamp} from './number';
import {SizedMap} from './sized';
import {getString, join} from './string';

type CancellableCallback<Callback extends GenericCallback> = Callback & {
	/**
	 * Cancel the callback
	 */
	cancel: () => void;
};

class Memoised<Callback extends GenericCallback> {
	declare readonly state: MemoisedState<Callback>;

	constructor(callback: Callback, cacheSize?: number) {
		const cache = new SizedMap<unknown, ReturnType<Callback>>(
			cacheSize ?? 2 ** 16,
		);

		const getter = (
			...parameters: Parameters<Callback>
		): ReturnType<Callback> => {
			const key =
				parameters.length === 1
					? parameters[0]
					: join(parameters.map(getString));

			if (cache?.has(key) ?? false) {
				return cache?.get(key) as ReturnType<Callback>;
			}

			const value = callback(...parameters);

			cache?.set(key, value);

			return value;
		};

		this.state = {cache, getter};
	}

	/**
	 * Clear the cache
	 */
	clear(): void {
		this.state.cache?.clear();
	}

	/**
	 * Delete a result from the cache
	 */
	delete(key: unknown): boolean {
		return this.state.cache?.delete(key) ?? false;
	}

	/**
	 * Destroy the instance, clearing its cache and removing its callback
	 */
	destroy(): void {
		this.state.cache?.clear();

		this.state.cache = undefined;
		this.state.getter = undefined;
	}

	/**
	 * Get a result from the cache if it exists _(or `undefined` otherwise)_
	 */
	get(key: unknown): ReturnType<Callback> | undefined {
		return this.state.cache?.get(key);
	}

	/**
	 * Does the result exist?
	 */
	has(key: unknown): boolean {
		return this.state.cache?.has(key) ?? false;
	}

	/**
	 * Get the result from the cache if it exists; otherwise runs the callback, caches the result, and returns it
	 */
	run(...parameters: Parameters<Callback>): ReturnType<Callback> {
		if (this.state.cache == null || this.state.getter == null) {
			throw new Error('The memoised instance has been destroyed');
		}

		return this.state.getter(...parameters);
	}
}

type MemoisedState<Callback extends GenericCallback> = {
	cache?: SizedMap<unknown, ReturnType<Callback>>;
	getter?: (...parameters: Parameters<Callback>) => ReturnType<Callback>;
};

/**
 * - Debounce a function, ensuring it is only called after `time` milliseconds have passed
 * - On subsequent calls, the timer is reset and will wait another `time` milliseconds _(and so on...)_
 * - Time is clamped between _0_ and _1000_ milliseconds
 * - Returns the callback with an added `cancel`-method for manually cancelling the debounce
 */
export function debounce<Callback extends GenericCallback>(
	callback: Callback,
	time?: number,
): CancellableCallback<Callback> {
	const interval = clamp(time ?? 0, 0, 1000);

	let timer: number;

	const debounced = ((...parameters: Parameters<Callback>) => {
		if (timer != null) {
			clearTimeout(timer);
		}

		timer = +setTimeout(() => {
			callback(...parameters);
		}, interval);
	}) as CancellableCallback<Callback>;

	debounced.cancel = () => {
		if (timer != null) {
			clearTimeout(timer);
		}
	};

	return debounced;
}

/**
 * Memoise a function, caching and retrieving results based on the first parameter
 */
export function memoise<Callback extends GenericCallback>(
	callback: Callback,
	cacheSize?: number,
): Memoised<Callback> {
	return new Memoised(callback, cacheSize);
}

/**
 * A function that does nothing, which can be useful, I guess…
 */
export function noop(): void {}

/**
 * - Throttle a function, ensuring it is only called once every `time` milliseconds
 * - Time is clamped between _0_ and _1000_ milliseconds
 */
export function throttle<Callback extends GenericCallback>(
	callback: Callback,
	time?: number,
): CancellableCallback<Callback> {
	const interval = clamp(time ?? 0, 0, 1000);

	let timestamp = performance.now();
	let timer: number;

	const throttler = (...parameters: Parameters<Callback>) => {
		if (timer != null) {
			clearTimeout(timer);
		}

		const now = performance.now();
		const difference = now - timestamp;

		if (difference >= interval) {
			timestamp = now;

			callback(...parameters);
		} else {
			timer = +setTimeout(() => {
				timestamp = performance.now();

				callback(...parameters);
			}, difference + interval);
		}
	};

	throttler.cancel = () => {
		if (timer != null) {
			clearTimeout(timer);
		}
	};

	return throttler as CancellableCallback<Callback>;
}
