import {isInstanceOfConstructor, isPrimitive} from '../internal/is';
import {equal} from '../internal/value/equal';

// #region Functions

/**
 * Does the value exist for a key in a Map?
 *
 * @param map Map to check in
 * @param value Value to check for
 * @returns `true` if the value exists, otherwise `false`
 */
export function inMap<Value>(map: Map<unknown, Value>, value: Value): boolean;

/**
 * Does the value exist for a key in a Map?
 *
 * @param map Map to check in
 * @param value Value to check for
 * @param key Return the key instead of the value
 * @returns Key for the value if it exists, otherwise `undefined`
 */
export function inMap<Key, Value>(map: Map<Key, Value>, value: Value, key: true): Key;

export function inMap<Key, Value>(map: Map<Key, Value>, value: Value, key?: unknown): unknown {
	const getKey = key === true;

	if (!isInstanceOfConstructor(Map, map)) {
		return getKey ? undefined : false;
	}

	if (!getKey) {
		return inSet(new Set(map.values()), value);
	}

	let found: Key | undefined;

	for (const [key, item] of map) {
		if (equal(item, value)) {
			found = key;
		}
	}

	return found;
}

/**
 * Does the value exist in a Set?
 *
 * @param set Set to check in
 * @param value Value to check for
 * @returns `true` if the value exists, otherwise `false`
 */
export function inSet<Value>(set: Set<Value>, value: Value): boolean {
	if (!isInstanceOfConstructor(Set, set)) {
		return false;
	}

	if (set.has(value)) {
		return true;
	}

	if (isPrimitive(value)) {
		return false;
	}

	for (const item of set) {
		if (equal(item, value)) {
			return true;
		}
	}

	return false;
}

// #endregion
