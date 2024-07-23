import type {GenericCallback} from './models';
import {clamp} from './number';

type Debounced<Callback extends GenericCallback> = Callback & {
	/**
	 * Cancels the debounce
	 */
	cancel: () => void;
};

type Memoised<Callback extends GenericCallback> = {
	readonly cache: Map<Parameters<Callback>[0], ReturnType<Callback>>;
	/**
	 * Clears the cache
	 */
	clear: () => void;
	/**
	 * Deletes a result from the cache
	 */
	delete: (key: Parameters<Callback>[0]) => boolean;
	/**
	 * Retrieves the result from the cache if it exists, or `undefined` otherwise
	 */
	get: (key: Parameters<Callback>[0]) => ReturnType<Callback> | undefined;
	/**
	 * Checks if the cache has a result for a given key
	 */
	has: (key: Parameters<Callback>[0]) => boolean;
	/**
	 * Retrieves the result from the cache if it exists, otherwise runs the callback, caches the result, and returns it
	 */
	run(...parameters: Parameters<Callback>): ReturnType<Callback>;
};

/**
 * - Debounces a function, ensuring it is only called after `time` milliseconds have passed
 * - On subsequent calls, the timer is reset and will wait another `time` milliseconds _(and so on...)_
 * - Time is clamped between _0_ and _1000_ milliseconds
 * - Returns the callback with an added `cancel`-method for manually cancelling the debounce
 */
export function debounce<Callback extends GenericCallback>(
	callback: Callback,
	time?: number,
): Debounced<Callback> {
	const interval = clamp(time ?? 0, 0, 1000);

	let timer: Timer | undefined;

	const debounced = ((...parameters: Parameters<Callback>) => {
		clearTimeout(timer);

		timer = setTimeout(() => {
			callback(...parameters);
		}, interval);
	}) as Debounced<Callback>;

	debounced.cancel = () => {
		clearTimeout(timer);
	};

	return debounced;
}

/**
 * Memoises a function, caching and retrieving results based on the first parameter
 */
export function memoise<Callback extends GenericCallback>(
	callback: Callback,
): Memoised<Callback> {
	function get(...parameters: unknown[]) {
		const key = parameters[0];

		if (cache.has(key)) {
			return cache.get(key);
		}

		const value = callback(...parameters);

		cache.set(key, value);

		return value;
	}

	const cache = new Map();

	return Object.create({
		cache,
		clear() {
			cache.clear();
		},
		delete(key: unknown) {
			return cache.delete(key);
		},
		get(key: unknown) {
			return cache.get(key);
		},
		has(key: unknown) {
			return cache.has(key);
		},
		run(...parameters: unknown[]) {
			return get(...parameters);
		},
	});
}

/**
 * A function that does nothing, which can be useful, I guess…
 */
export function noop(): void {}

/**
 * - Throttles a function, ensuring it is only called once every `time` milliseconds
 * - Time is clamped between _0_ and _1000_ milliseconds
 */
export function throttle<Callback extends GenericCallback>(
	callback: Callback,
	time?: number,
): Callback {
	const interval = clamp(time ?? 0, 0, 1000);

	let timestamp = performance.now();
	let timer: Timer | undefined;

	return ((...parameters: Parameters<Callback>) => {
		clearTimeout(timer);

		const now = performance.now();
		const difference = now - timestamp;

		if (difference >= interval) {
			timestamp = now;

			callback(...parameters);
		} else {
			timer = setTimeout(() => {
				timestamp = performance.now();

				callback(...parameters);
			}, difference + interval);
		}
	}) as Callback;
}
