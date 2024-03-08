import {chunk} from './array';
import {ArrayOrPlainObject, PlainObject, isArrayOrPlainObject} from './is';
import {getString} from './string';

export type DiffType = 'full' | 'none' | 'partial';

export type DiffResult<T1 = unknown, T2 = T1> = {
	original: DiffValue<T1, T2>;
	type: DiffType;
	values: Record<string, DiffValue>;
};

export type DiffValue<T1 = unknown, T2 = T1> = {
	from: T1;
	to: T2;
};

export type Key = number | string;

type KeyedDiffValue = {
	key: string;
} & DiffValue;

export type ValueObject = ArrayOrPlainObject | Map<unknown, unknown>;

function _cloneNested(value: ArrayOrPlainObject): ArrayOrPlainObject {
	const cloned = Array.isArray(value) ? [] : {};
	const keys = Object.keys(value);
	const {length} = keys;

	let index = 0;

	for (; index < length; index += 1) {
		const key = keys[index];

		cloned[key as never] = clone(value[key as never]);
	}

	return cloned;
}

function _cloneRegularExpression(value: RegExp): RegExp {
	const cloned = new RegExp(value.source, value.flags);

	cloned.lastIndex = value.lastIndex;

	return cloned;
}

function _getDiffs(
	first: unknown,
	second: unknown,
	prefix?: string,
): KeyedDiffValue[] {
	const changes: KeyedDiffValue[] = [];
	const checked = new Set<Key>();

	let outer = 0;

	for (; outer < 2; outer += 1) {
		const value = outer === 0 ? first : second;

		if (!value) {
			continue;
		}

		const keys = Object.keys(value);
		const {length} = keys;

		let inner = 0;

		for (; inner < length; inner += 1) {
			const key = keys[inner];

			if (checked.has(key)) {
				continue;
			}

			const from = first?.[key as never];
			const to = second?.[key as never];

			if (!Object.is(from, to)) {
				const prefixed = _getKey(prefix, key);

				const change = {
					from,
					to,
					key: prefixed,
				};

				const nested = isArrayOrPlainObject(from) || isArrayOrPlainObject(to);
				const diffs = nested ? _getDiffs(from, to, prefixed) : [];

				if (!nested || (nested && diffs.length > 0)) {
					changes.push(change);
				}

				changes.push(...diffs);
			}

			checked.add(key);
		}
	}

	return changes;
}

function _getKey(...parts: Array<Key | undefined>): string {
	return parts.filter(part => part !== undefined).join('.');
}

/**
 * Internal function to get a value from an object
 */
function _getValue(data: ValueObject, key: string): unknown {
	if (
		typeof data !== 'object' ||
		data === null ||
		/^(__proto__|constructor|prototype)$/i.test(key)
	) {
		return;
	}

	return data instanceof Map ? data.get(key as never) : data[key as never];
}

/**
 * Internal function to set a value in an object
 */
function _setValue(data: ValueObject, key: string, value: unknown): void {
	if (
		typeof data !== 'object' ||
		data === null ||
		/^(__proto__|constructor|prototype)$/i.test(key)
	) {
		return;
	}

	if (data instanceof Map) {
		data.set(key as never, value);
	} else {
		data[key as never] = value as never;
	}
}

/**
 * Clones any kind of value
 */
export function clone<T>(value: T): T {
	switch (true) {
		case value == null:
		case typeof value === 'function':
			return value;

		case typeof value === 'bigint':
			return BigInt(value) as T;

		case typeof value === 'boolean':
			return Boolean(value) as T;

		case typeof value === 'number':
			return Number(value) as T;

		case typeof value === 'string':
			return String(value) as T;

		case typeof value === 'symbol':
			return Symbol(value.description) as T;

		case value instanceof Node:
			return value.cloneNode(true) as T;

		case value instanceof RegExp:
			return _cloneRegularExpression(value) as T;

		case isArrayOrPlainObject(value):
			return _cloneNested(value) as T;

		default:
			return structuredClone(value);
	}
}

/**
 * - Find the differences between two values
 * - Returns an object holding the result:
 * 	- `original` holds the original values
 * 	- `type` is the type of difference:
 * 		- `full` if the values are completely different
 * 		- `none` if the values are the same
 * 		- `partial` if the values are partially different
 * 	- `values` holds the differences with dot-notation keys
 */
export function diff<T1 = unknown, T2 = T1>(
	first: T1,
	second: T2,
): DiffResult<T1, T2> {
	const result: DiffResult<T1, T2> = {
		original: {
			from: first,
			to: second,
		},
		type: 'partial',
		values: {},
	};

	const same = Object.is(first, second);

	const firstIsArrayOrObject = isArrayOrPlainObject(first);
	const secondIsArrayOrObject = isArrayOrPlainObject(second);

	if (same || (!firstIsArrayOrObject && !secondIsArrayOrObject)) {
		result.type = same ? 'none' : 'full';

		return result;
	}

	if (firstIsArrayOrObject !== secondIsArrayOrObject) {
		result.type = 'full';
	}

	const diffs = _getDiffs(first, second);
	const {length} = diffs;

	if (length === 0) {
		result.type = 'none';
	}

	let index = 0;

	for (; index < length; index += 1) {
		const diff = diffs[index];

		result.values[diff.key] = {from: diff.from, to: diff.to};
	}

	return result;
}

/**
 * - Get the value from an object using a key path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - Returns `undefined` if the value is not found
 */
export function get(data: ValueObject, key: Key): unknown {
	const parts = getString(key).split('.');
	const {length} = parts;

	let index = 0;
	let value = typeof data === 'object' ? data ?? {} : {};

	for (; index < length; index += 1) {
		value = _getValue(value, parts[index]) as ValueObject;

		if (value == null) {
			return;
		}
	}

	return value;
}

/**
 * Merges multiple arrays or objects into a single one
 */
export function merge<T = ArrayOrPlainObject>(...values: T[]): T {
	if (values.length === 0) {
		return {} as T;
	}

	const actual = values.filter(value =>
		isArrayOrPlainObject(value),
	) as PlainObject[];

	const result = (actual.every(Array.isArray) ? [] : {}) as PlainObject;

	const {length} = actual;

	let itemIndex = 0;

	for (; itemIndex < length; itemIndex += 1) {
		const item = actual[itemIndex];
		const keys = Object.keys(item);
		const size = keys.length;

		let keyIndex = 0;

		for (; keyIndex < size; keyIndex += 1) {
			const key = keys[keyIndex];
			const next = item[key];
			const previous = result[key];

			if (isArrayOrPlainObject(next)) {
				result[key] = isArrayOrPlainObject(previous)
					? merge(previous, next)
					: merge(next);
			} else {
				result[key] = next;
			}
		}
	}

	return result as T;
}

/**
 * - Set the value in an object using a key path
 * - You can set a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If a part of the path does not exist, it will be created, either as an array or a generic object, depending on the key
 * - Returns the original object
 */
export function set<T extends ValueObject>(
	data: T,
	key: Key,
	value: unknown,
): T {
	const parts = getString(key).split('.');
	const {length} = parts;
	const lastIndex = length - 1;

	let index = 0;
	let target: ValueObject = typeof data === 'object' ? data ?? {} : {};

	for (; index < length; index += 1) {
		const part = parts[index];

		if (parts.indexOf(part) === lastIndex) {
			_setValue(target, part, value);

			break;
		}

		let next = _getValue(target, part);

		if (typeof next !== 'object' || next === null) {
			next = /^\d+$/.test(part) ? [] : {};

			target[part as never] = next as never;
		}

		target = next as ValueObject;
	}

	return data;
}
