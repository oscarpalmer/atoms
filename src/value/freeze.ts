import {noop} from '../function';
import {isPlainObject} from '../is';
import type {ArrayOrPlainObject, GenericCallback, PlainObject} from '../models';

// #region Types

/**
 * A frozen value with readonly properties _(going as deep as possible)_
 */
export type Frozen<Value> = Value extends unknown[]
	? Readonly<Value>
	: Value extends PlainObject
		? {
				readonly [Key in keyof Value]: Frozen<Value[Key]>;
			}
		: Value extends Map<infer Key, infer Value>
			? ReadonlyMap<Key, Frozen<Value>>
			: Value extends Set<infer Item>
				? ReadonlySet<Frozen<Item>>
				: Readonly<Value>;

// #endregion

// #region Functions

function fakeDelete(): boolean {
	return false;
}

/**
 * Freeze an array and its indiced values, but not any nested values
 *
 * _Available as `flatFreeze` and `freeze.flat`_
 *
 * @param array Array to freeze
 * @returns Frozen array
 */
export function flatFreeze<Item>(array: Item[]): ReadonlyArray<Item>;

/**
 * Freeze a map and its values, but not any nested values
 *
 * _Available as `flatFreeze` and `freeze.flat`_
 *
 * @param map Map to freeze
 * @returns Frozen map
 */
export function flatFreeze<Key, Value>(map: Map<Key, Value>): ReadonlyMap<Key, Value>;

/**
 * Freeze an object and its properties, but not any nested values
 *
 * _Available as `flatFreeze` and `freeze.flat`_
 *
 * @param object Object to freeze
 * @returns Frozen object
 */
export function flatFreeze<Value extends PlainObject>(object: Value): Readonly<Value>;

/**
 * Freeze a set and its values, but not any nested values
 *
 * _Available as `flatFreeze` and `freeze.flat`_
 *
 * @param set Set to freeze
 * @returns Frozen set
 */
export function flatFreeze<Item>(set: Set<Item>): ReadonlySet<Item>;

/**
 * Freeze any value, if possible
 *
 * _(Only arrays, maps, plain objects, and sets are freezable)_
 *
 * _Available as `flatFreeze` and `freeze.flat`_
 *
 * @param value Value to freeze
 * @returns Frozen value
 */
export function flatFreeze<Value>(value: Value): Value;

export function flatFreeze(value: unknown): unknown {
	return freezeValue(value, new WeakSet(), true);
}

/**
 * Freeze an array and its values _(but not any nested values)_, preventing modifications
 *
 * @param array Array to freeze
 * @param flat Freeze _only_ the array, not any nested values
 * @returns Frozen array
 */
export function freeze<Item>(array: Item[], flat: true): ReadonlyArray<Item>;

/**
 * Freeze a map and its values _(but not any nested values)_, preventing modifications
 *
 * @param map Map to freeze
 * @param flat Freeze _only_ the map, not any nested values
 * @returns Frozen map
 */
export function freeze<Key, Value>(map: Map<Key, Value>, flat: true): ReadonlyMap<Key, Value>;

/**
 * Freeze an object and its properties _(but not any nested values)_, preventing modifications
 *
 * @param object Object to freeze
 * @param flat Freeze _only_ the object, not any nested values
 * @returns Frozen object
 */
export function freeze<Value extends PlainObject>(object: Value, flat: true): Readonly<Value>;

/**
 * Freeze a set and its values _(but not any nested values)_, preventing modifications
 *
 * @param set Set to freeze
 * @param flat Freeze _only_ the set, not any nested values
 * @returns Frozen set
 */
export function freeze<Item>(set: Set<Item>, flat: true): ReadonlySet<Item>;

/**
 * Freeze an array and its values recursively, preventing modifications
 *
 * _(If you only want to freeze the array itself, but not any nested values, use `freeze(array, true)`, `freeze.flat(array)`, or `flatFreeze(array)` instead)_
 *
 * @param array Array to freeze
 * @returns Frozen array
 */
export function freeze<Item>(array: Item[]): Frozen<Item[]>;

/**
 * Freeze a map and its values recursively, preventing modifications
 *
 * _(If you only want to freeze the map itself, but not any nested values, use `freeze(map, true)`, `freeze.flat(map)`, or `flatFreeze(map)` instead)_
 *
 * @param map Map to freeze
 * @returns Frozen map
 */
export function freeze<Key, Value>(map: Map<Key, Value>): Frozen<Map<Key, Value>>;

/**
 * Freeze an object and all its properties recursively
 *
 * _(If you only want to freeze the object itself, but not any nested values, use `freeze(object, true)`, `freeze.flat(object)`, or `flatFreeze(object)` instead)_
 *
 * @param object Object to freeze
 * @returns Frozen object
 */
export function freeze<Value extends PlainObject>(object: Value): Frozen<Value>;

/**
 * Freeze a set and its values recursively
 *
 * _(If you only want to freeze the set itself, but not any nested values, use `freeze(set, true)`, `freeze.flat(set)`, or `flatFreeze(set)` instead)_
 *
 * @param set Set to freeze
 * @returns Frozen set
 */
export function freeze<Item>(set: Set<Item>): Frozen<Set<Item>>;

/**
 * Freeze any value, if possible
 *
 * _(Only arrays, maps, plain objects, and sets are freezable)_
 *
 * @param value Value to freeze
 * @returns Frozen value
 */
export function freeze<Value>(value: Value): Value;

export function freeze(value: unknown, flat?: unknown): unknown {
	return freezeValue(value, new WeakSet(), flat === true);
}

freeze.flat = flatFreeze;
freeze.is = isFrozen;

function freezeArray(array: unknown[], references: WeakSet<any>, flat: boolean): Frozen<unknown[]> {
	if (flat) {
		return Object.freeze(array) as Frozen<unknown[]>;
	}

	references.add(array);

	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const value = array[index];

		if (!references.has(value)) {
			array[index] = freezeValue(array[index], references, false);
		}
	}

	return Object.freeze(array) as Frozen<unknown[]>;
}

function freezeMap(
	map: Map<unknown, unknown>,
	references: WeakSet<any>,
	flat: boolean,
): ReadonlyMap<unknown, unknown> {
	frozenValues.add(map);

	map.clear = noop;
	map.delete = fakeDelete;
	map.set = () => map;

	if (flat) {
		return map as ReadonlyMap<unknown, unknown>;
	}

	references.add(map);

	const entries = map.entries();

	for (const [key, value] of entries) {
		if (!references.has(value)) {
			map.set(key, freezeValue(value, references, false));
		}
	}

	return map as ReadonlyMap<unknown, unknown>;
}

function freezeObject(
	object: PlainObject,
	references: WeakSet<any>,
	flat: boolean,
): Frozen<PlainObject> {
	if (flat) {
		return Object.freeze(object) as Frozen<PlainObject>;
	}

	references.add(object);

	const keys = Object.keys(object);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (!references.has(object[key])) {
			object[key] = freezeValue(object[key], references, false);
		}
	}

	return Object.freeze(object) as Frozen<PlainObject>;
}

function freezeSet(
	set: Set<unknown>,
	references: WeakSet<any>,
	flat: boolean,
): ReadonlySet<unknown> {
	frozenValues.add(set);

	set.clear = noop;
	set.delete = fakeDelete;
	set.add = () => set;

	if (flat) {
		return set as ReadonlySet<unknown>;
	}

	references.add(set);

	const values = set.values();

	for (const value of values) {
		if (!references.has(value)) {
			set.add(freezeValue(value, references, false));
		}
	}

	return set as ReadonlySet<unknown>;
}

function freezeValue(value: unknown, references: WeakSet<any>, flat: boolean): unknown {
	switch (true) {
		case isFrozen(value):
			return value;

		case value instanceof Map:
			return freezeMap(value, references, flat);

		case value instanceof Set:
			return freezeSet(value, references, flat);

		case Array.isArray(value):
			return freezeArray(value, references, flat);

		case isPlainObject(value):
			return freezeObject(value, references, flat);

		default:
			return value;
	}
}

/**
 * Is the value frozen?
 *
 * @param value Value to check
 * @returns `true` if the value is frozen, otherwise `false`
 */
export function isFrozen(value: unknown): boolean {
	if (value instanceof Map || value instanceof Set) {
		return frozenValues.has(value);
	}

	return typeof value === 'object' && value !== null && Object.isFrozen(value);
}

// #endregion

// #region Variables

const frozenValues = new WeakSet();

// #endregion
