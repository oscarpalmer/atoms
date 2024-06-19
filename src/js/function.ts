import type {GenericCallback} from './models';

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
