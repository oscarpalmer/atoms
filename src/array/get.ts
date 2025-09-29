import {isPlainObject} from '../internal/is';
import type {PlainObject} from '../models';
import type {NumericalKeys} from './models';

/**
 * Get an array
 * @param value Original array
 * @returns Original array
 */
export function getArray<Item>(value: Item[]): Item[];

/**
 * Get an array from an object
 * @param value Object to convert to an array
 * @returns Array holding the values of the object
 */
export function getArray<Value extends PlainObject>(
	value: Value,
): Value[keyof Value][];

/**
 * Get an array from an object, where only values with numerical keys will be included
 * @param value Object to convert to an array
 * @returns Array holding the values of the object's numerical keys
 */
export function getArray<Value extends PlainObject>(
	value: Value,
	indiced: true,
): Value[NumericalKeys<Value>][];

/**
 * Get an array from a value
 * @param value Value to convert to an array
 * @returns Array holding the value
 */
export function getArray<Item>(value: Item): Item[];

/**
 * Get an array from an unknown value
 * @param value Value to convert to an array
 * @returns Array of value
 */
export function getArray(value: unknown): unknown[];

export function getArray(value: unknown, indiced?: unknown): unknown[] {
	if (Array.isArray(value)) {
		return value;
	}

	if (!isPlainObject(value)) {
		return [value];
	}

	if (indiced !== true) {
		return Object.values(value);
	}

	const keys = Object.keys(value);
	const {length} = keys;

	const array: unknown[] = [];

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (!Number.isNaN(Number(key))) {
			array.push(value[key]);
		}
	}

	return array;
}
