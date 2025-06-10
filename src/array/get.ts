import {isPlainObject} from '../internal/is';
import type {PlainObject} from '../models';

type NumericalKeys<Value> = {
	[Key in keyof Value]: Key extends number
		? Key
		: Key extends `${number}`
			? Key
			: never;
}[keyof Value];

/**
 * Get an array from a value
 */
export function getArray<Item>(value: Item[]): Item[];

/**
 * Get an array from an object
 */
export function getArray<Value extends PlainObject>(
	value: Value,
): Array<Value[keyof Value]>;

/**
 * Get an array from an object, where only values with numeric keys will be included
 */
export function getArray<Value extends PlainObject>(
	value: Value,
	indiced: true,
): Array<Value[NumericalKeys<Value>]>;

/**
 * Get an array from a value
 */
export function getArray<Item>(value: Item): Item[];

/**
 * Get an array from a value
 */
export function getArray(value: unknown): unknown[];

export function getArray(value: unknown, indiced?: unknown): unknown[] {
	if (Array.isArray(value)) {
		return value;
	}

	if (isPlainObject(value)) {
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

	return [value];
}
