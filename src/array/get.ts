import {isNonPlainObject} from '../internal/is';
import type {NumericalKeys, PlainObject} from '../models';

// #region Functions

/**
 * Get an array from an object, where only values with numerical keys will be included
 *
 * @param value Object to convert to an array
 * @returns Array holding the values of the object's numerical keys
 *
 * @example
 * ```typescript
 * getArray({0: 'a', 1: 'b', 2: 'c', d: 'd'}, true); // => ['a', 'b', 'c']
 * getArray({a: 'a', b: 'b', c: 'c', d: 'd'}, true); // => []
 * ```
 */
export function getArray<Value extends PlainObject>(
	value: Value,
	indiced: true,
): Value[NumericalKeys<Value>][];

/**
 * Get an array from a map
 *
 * @param value Map to convert to an array
 * @returns Array holding the entries of the map
 *
 * @example
 * ```typescript
 * getArray(
 *   new Map([['a', 1], ['b', 2], ['c', 3]]),
 * ); // => [['a', 1], ['b', 2], ['c', 3]]
 * ```
 */
export function getArray<Key, Value>(map: Map<Key, Value>): [Key, Value][];

/**
 * Get an array from an object
 *
 * @param value Object to convert to an array
 * @returns Array holding the values of the object
 *
 * @example
 * ```typescript
 * getArray({0: 'a', 1: 'b', 2: 'c', d: 'd'}); // => ['a', 'b', 'c', 'd']
 * getArray({a: 'a', b: 'b', c: 'c', d: 'd'}); // => ['a', 'b', 'c', 'd']
 * ```
 */
export function getArray<Value extends PlainObject>(
	value: Value,
): [keyof Value, Value[keyof Value]][];

/**
 * Get an array from a set
 *
 * @param value Set to convert to an array
 * @returns Array holding the values of the set
 *
 * @example
 * ```typescript
 * getArray(new Set([123, 456, 789])); // => [123, 456, 789]
 * ```
 */
export function getArray<Value>(set: Set<Value>): Value[];

/**
 * Get an array from a value
 *
 * @param value Original array
 * @returns Original array
 *
 * @example
 * ```typescript
 * getArray([123]); // => [123]
 * ```
 */
export function getArray<Item>(value: Item[]): Item[];

/**
 * Get an array from an unknown value
 *
 * @param value Value to convert to an array
 * @returns Array of value
 *
 * @example
 * ```typescript
 * getArray(123); // => [123]
 * ```
 */
export function getArray<Value>(value: Value): Value[];

export function getArray(value: unknown, indiced?: unknown): unknown[] {
	if (Array.isArray(value)) {
		return value;
	}

	if (value instanceof Map) {
		return [...value.entries()];
	}

	if (value instanceof Set) {
		return [...value.values()];
	}

	if (isNonPlainObject(value)) {
		return [value];
	}

	if (indiced !== true) {
		return Object.entries(value);
	}

	const keys = Object.keys(value);
	const {length} = keys;

	const array: unknown[] = [];

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const asNumber = Number.parseInt(key, 10);

		if (!Number.isNaN(asNumber)) {
			array[asNumber] = (value as Record<string, unknown>)[key];
		}
	}

	return array;
}

// #endregion
