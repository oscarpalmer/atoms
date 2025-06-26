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
	declare readonly state: MemoizedState<Callback>;

	constructor(callback: Callback, size?: number) {
		const cache = new SizedMap<unknown, ReturnType<Callback>>(size ?? 2 ** 16);

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

type MemoizedState<Callback extends GenericCallback> = {
	cache?: SizedMap<unknown, ReturnType<Callback>>;
	getter?: (...parameters: Parameters<Callback>) => ReturnType<Callback>;
};

/**
 * - Debounce a function, ensuring it is only called after `time` milliseconds have passed
 * - On subsequent calls, the timer is reset and will wait another `time` milliseconds _(and so on...)_
 * - Returns the callback with an added `cancel`-method for manually cancelling the debounce
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

	const debounced = (...parameters: Parameters<Callback>) => {
		debounced.cancel();

		frame = requestAnimationFrame(now => {
			start = now - milliseconds;

			step(now, parameters);
		});
	};

	debounced.cancel = () => {
		if (frame != null) {
			cancelAnimationFrame(frame);

			frame = undefined;
		}
	};

	return debounced as CancellableCallback<Callback>;
}

/**
 * Memoise a function, caching and retrieving results based on the first parameter
 */
export function memoize<Callback extends GenericCallback>(
	callback: Callback,
	cacheSize?: number,
): Memoized<Callback> {
	return new Memoized(
		callback,
		typeof cacheSize === 'number' ? cacheSize : undefined,
	);
}

/**
 * Throttle a function, ensuring it is only called once every `time` milliseconds
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

	const throttler = (...parameters: Parameters<Callback>) => {
		throttler.cancel();

		frame = requestAnimationFrame(now => {
			last ??= now - milliseconds;

			step(now, parameters);
		});
	};

	throttler.cancel = () => {
		if (frame != null) {
			cancelAnimationFrame(frame);

			frame = undefined;
		}
	};

	return throttler as CancellableCallback<Callback>;
}

export type {CancellableCallback, GenericCallback, Memoized};
export {noop} from './internal/function';
