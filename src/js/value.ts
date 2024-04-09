import type {ToString} from 'type-fest/source/internal';
import {isArrayOrPlainObject} from './is';
import type {ArrayOrPlainObject, Get, Key, Paths, PlainObject} from './models';

export type DiffType = 'full' | 'none' | 'partial';

export type DiffResult<First, Second = First> = {
	original: DiffValue<First, Second>;
	type: DiffType;
	values: Record<string, DiffValue>;
};

export type DiffValue<First = unknown, Second = First> = {
	from: First;
	to: Second;
};

type KeyedDiffValue = {
	key: string;
} & DiffValue;

function _cloneNested(value: ArrayOrPlainObject): ArrayOrPlainObject {
	const cloned = (Array.isArray(value) ? [] : {}) as PlainObject;
	const keys = Object.keys(value);
	const {length} = keys;

	let index = 0;

	for (; index < length; index += 1) {
		const key = keys[index];

		cloned[key] = clone((value as PlainObject)[key]);
	}

	return cloned;
}

function _cloneRegularExpression(value: RegExp): RegExp {
	const cloned = new RegExp(value.source, value.flags);

	cloned.lastIndex = value.lastIndex;

	return cloned;
}

function _findKey(
	needle: string,
	haystack: PlainObject,
	ignoreCase: boolean,
): string {
	if (!ignoreCase) {
		return needle;
	}

	const keys = Object.keys(haystack);
	const normalised = keys.map(key => key.toLowerCase());
	const index = normalised.indexOf(needle.toLowerCase());

	return index > -1 ? keys[index] : needle;
}

function _getDiffs(
	first: ArrayOrPlainObject,
	second: ArrayOrPlainObject,
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

				const diffs = nested
					? _getDiffs(from as PlainObject, to as PlainObject, prefixed)
					: [];

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
	return parts.filter(part => part != null).join('.');
}

function _handleValue(
	data: PlainObject,
	path: string,
	value: unknown,
	get: boolean,
	ignoreCase: boolean,
): unknown {
	if (
		typeof data === 'object' &&
		data !== null &&
		!/^(__proto__|constructor|prototype)$/i.test(path)
	) {
		const key = _findKey(path, data, ignoreCase);

		if (get) {
			return data[key];
		}

		data[key] = value;
	}
}

/**
 * Clones any kind of value
 */
export function clone<Value>(value: Value): Value {
	switch (true) {
		case value == null:
		case typeof value === 'function':
			return value;

		case typeof value === 'bigint':
			return BigInt(value) as Value;

		case typeof value === 'boolean':
			return Boolean(value) as Value;

		case typeof value === 'number':
			return Number(value) as Value;

		case typeof value === 'string':
			return String(value) as Value;

		case typeof value === 'symbol':
			return Symbol(value.description) as Value;

		case value instanceof Node:
			return value.cloneNode(true) as Value;

		case value instanceof RegExp:
			return _cloneRegularExpression(value) as Value;

		case isArrayOrPlainObject(value):
			return _cloneNested(value) as Value;

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
export function diff<First, Second = First>(
	first: First,
	second: Second,
): DiffResult<First, Second> {
	const result: DiffResult<First, Second> = {
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

	const diffs = _getDiffs(
		first as ArrayOrPlainObject,
		second as ArrayOrPlainObject,
	);

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
 * - Get the value from an object using a known path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - Returns `undefined` if the value is not found
 */
export function getValue<Data extends PlainObject, Path extends Paths<Data>>(
	data: Data,
	path: Path,
): Get<Data, ToString<Path>>;

/**
 * - Get the value from an object using an unknown path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If `ignoreCase` is `true`, path matching will be case-insensitive
 * - Returns `undefined` if the value is not found
 */
export function getValue<Data extends PlainObject>(
	data: Data,
	path: string,
	ignoreCase?: boolean,
): unknown;

export function getValue(
	data: PlainObject,
	path: string,
	ignoreCase?: boolean,
): unknown {
	const shouldIgnoreCase = ignoreCase === true;
	const parts = (shouldIgnoreCase ? path.toLowerCase() : path).split('.');
	const {length} = parts;

	let index = 0;
	let value = typeof data === 'object' ? data ?? {} : {};

	while (index < length && value != null) {
		value = _handleValue(
			value,
			parts[index++],
			null,
			true,
			shouldIgnoreCase,
		) as PlainObject;
	}

	return value as never;
}

/**
 * Merges multiple arrays or objects into a single one
 */
export function merge<Model extends ArrayOrPlainObject>(
	...values: Model[]
): Model {
	if (values.length === 0) {
		return {} as Model;
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

	return result as Model;
}

/**
 * - Set the value in an object using a known path
 * - You can set a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If a part of the path does not exist, it will be created, either as an array or a generic object, depending on the path
 * - Returns the original object
 */
export function setValue<Data extends PlainObject, Path extends Paths<Data>>(
	data: Data,
	path: Path,
	value: unknown,
): Data;

/**
 * - Set the value in an object using an unknown path
 * - You can set a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If a part of the path does not exist, it will be created, either as an array or a generic object, depending on the path
 * - If `ignoreCase` is `true`, path matching will be case-insensitive
 * - Returns the original object
 */
export function setValue<Data extends PlainObject>(
	data: Data,
	path: string,
	value: unknown,
	ignoreCase?: boolean,
): Data;

export function setValue<Data extends PlainObject>(
	data: Data,
	path: string,
	value: unknown,
	ignoreCase?: boolean,
): Data {
	const shouldIgnoreCase = ignoreCase === true;
	const parts = (shouldIgnoreCase ? path.toLowerCase() : path).split('.');
	const {length} = parts;
	const lastIndex = length - 1;

	let index = 0;
	let target: PlainObject = typeof data === 'object' ? data ?? {} : {};

	for (; index < length; index += 1) {
		const part = parts[index];

		if (parts.indexOf(part) === lastIndex) {
			_handleValue(target, part, value, false, shouldIgnoreCase);

			break;
		}

		let next = _handleValue(target, part, null, true, shouldIgnoreCase);

		if (typeof next !== 'object' || next === null) {
			next = /^\d+$/.test(part) ? [] : {};

			target[part] = next;
		}

		target = next as PlainObject;
	}

	return data;
}
