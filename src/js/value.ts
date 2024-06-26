import type {ToString} from 'type-fest/source/internal';
import {isArrayOrPlainObject, isNumerical} from './is';
import type {ArrayOrPlainObject, Get, Key, Paths, PlainObject} from './models';
import {join} from './string';

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

	const diffs = getDiffs(
		first as ArrayOrPlainObject,
		second as ArrayOrPlainObject,
	);

	const {length} = diffs;

	if (length === 0) {
		result.type = 'none';
	}

	for (let index = 0; index < length; index += 1) {
		const diff = diffs[index];

		result.values[diff.key] = {from: diff.from, to: diff.to};
	}

	return result;
}

function findKey(
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

function getDiffs(
	first: ArrayOrPlainObject,
	second: ArrayOrPlainObject,
	prefix?: string,
): KeyedDiffValue[] {
	const changes: KeyedDiffValue[] = [];
	const checked = new Set<Key>();

	for (let outerIndex = 0; outerIndex < 2; outerIndex += 1) {
		const value = outerIndex === 0 ? first : second;

		if (!value) {
			continue;
		}

		const keys = Object.keys(value);
		const {length} = keys;

		for (let innerIndex = 0; innerIndex < length; innerIndex += 1) {
			const key = keys[innerIndex];

			if (checked.has(key)) {
				continue;
			}

			const from = first?.[key as never];
			const to = second?.[key as never];

			if (!Object.is(from, to)) {
				const prefixed = join([prefix, key], '.');

				const change = {
					from,
					to,
					key: prefixed,
				};

				const nested = isArrayOrPlainObject(from) || isArrayOrPlainObject(to);

				const diffs = nested
					? getDiffs(from as PlainObject, to as PlainObject, prefixed)
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
		value = handleValue(
			value,
			parts[index++],
			null,
			true,
			shouldIgnoreCase,
		) as PlainObject;
	}

	return value as never;
}

function handleValue(
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
		const key = findKey(path, data, ignoreCase);

		if (get) {
			return data[key];
		}

		data[key] = value;
	}
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

	for (let outerIndex = 0; outerIndex < length; outerIndex += 1) {
		const item = actual[outerIndex];
		const keys = Object.keys(item);
		const size = keys.length;

		for (let innerIndex = 0; innerIndex < size; innerIndex += 1) {
			const key = keys[innerIndex];
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

	let previous: PlainObject | undefined;
	let target: PlainObject =
		typeof data === 'object' && data !== null ? data : {};

	for (let index = 0; index < length; index += 1) {
		const part = parts[index];

		if (parts.indexOf(part) === lastIndex) {
			handleValue(target, part, value, false, shouldIgnoreCase);

			break;
		}

		let next = handleValue(target, part, null, true, shouldIgnoreCase);

		if (typeof next !== 'object' || next === null) {
			if (isNumerical(part) && previous != null) {
				const temporary = previous[parts[index - 1]];

				if (!Array.isArray(temporary)) {
					previous[parts[index - 1]] =
						typeof temporary === 'object' &&
						temporary !== null &&
						Object.keys(temporary).every(isNumerical)
							? Object.values(temporary)
							: [];

					target = previous[parts[index - 1]] as PlainObject;
				}
			}

			next = {};

			target[part] = next;
		}

		previous = target;
		target = next as PlainObject;
	}

	return data;
}
