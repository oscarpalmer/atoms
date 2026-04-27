import {isPlainObject} from '../is';
import type {ArrayOrPlainObject, GenericCallback, PlainObject} from '../models';

// #region Types

/**
 * A frozen value with readonly properties _(going as deep as possible)_
 */
export type Frozen<Value extends ArrayOrPlainObject> = {
	readonly [Key in keyof Value]: Value[Key] extends ArrayOrPlainObject
		? Frozen<Value[Key]>
		: Value[Key];
};

// #endregion

// #region Functions

/**
 * Freeze an array and all its indices recursively
 * @param array Array to freeze
 * @returns Frozen array
 */
export function freeze<Item>(array: Item[]): Frozen<Item[]>;

/**
 * Freeze a function
 * @param fn Function to freeze
 * @returns Frozen function
 */
export function freeze<Fn extends GenericCallback>(fn: Fn): Readonly<Fn>;

/**
 * Freeze an object and all its properties recursively
 * @param object Object to freeze
 * @returns Frozen object
 */
export function freeze<Value extends PlainObject>(object: Value): Frozen<Value>;

/**
 * Freeze any value, if possible
 *
 * _(Only arrays, functions, and plain objects are freezable)_
 * @param value Value to freeze
 * @returns Frozen value
 */
export function freeze<Value>(value: Value): Value;

export function freeze(value: unknown): unknown {
	return freezeValue(value, new WeakSet());
}

function freezeArray(array: unknown[], references: WeakSet<any>): Frozen<unknown[]> {
	references.add(array);

	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const value = array[index];

		if (!references.has(value)) {
			array[index] = freezeValue(array[index], references);
		}
	}

	return Object.freeze(array) as Frozen<unknown[]>;
}

function freezeFunction(fn: Function, references: WeakSet<any>): Readonly<Function> {
	references.add(fn);

	return Object.freeze(fn);
}

function freezeObject(object: PlainObject, references: WeakSet<any>): Frozen<PlainObject> {
	references.add(object);

	const keys = Object.keys(object);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (!references.has(object[key])) {
			object[key] = freezeValue(object[key], references);
		}
	}

	return Object.freeze(object) as Frozen<PlainObject>;
}

function freezeValue(value: unknown, references: WeakSet<any>): unknown {
	switch (true) {
		case typeof value === 'function':
			return freezeFunction(value, references);

		case Array.isArray(value):
			return freezeArray(value, references);

		case isPlainObject(value):
			return freezeObject(value, references);

		default:
			return value;
	}
}

// #endregion
