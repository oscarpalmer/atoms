import {equal} from '../internal/value/equal';

/**
 * Does the value exist for a key in a map?
 * @param map Map to check in
 * @param value Value to check for
 * @returns `true` if the value exists, otherwise `false`
 */
export function inMap<Value>(map: Map<unknown, Value>, value: Value): boolean;

/**
 * Does the value exist for a key in a map?
 * @param map Map to check in
 * @param value Value to check for
 * @param key To return the key for the value
 * @return The key for the value if it exists, otherwise `undefined`
 */
export function inMap<Key, Value>(map: Map<Key, Value>, value: Value, key: true): Key;

export function inMap<Key, Value>(map: Map<Key, Value>, value: Value, key?: unknown): unknown {
	const getKey = key === true;

	if (!(map instanceof Map)) {
		return getKey ? undefined : false;
	}

	if (!getKey) {
		return inSet(new Set(map.values()), value);
	}

	for (const [key, item] of map) {
		if (equal(item, value)) {
			return key;
		}
	}
}

/**
 * Does the value exist in a set?
 * @param set Set to check in
 * @param value Value to check for
 * @returns `true` if the value exists, otherwise `false`
 */
export function inSet<Value>(set: Set<Value>, value: Value): boolean {
	if (!(set instanceof Set)) {
		return false;
	}

	if (set.has(value)) {
		return true;
	}

	for (const item of set) {
		if (equal(item, value)) {
			return true;
		}
	}

	return false;
}
