import {getString} from './string';

export type ArrayOrObject = unknown[] | GenericObject;

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

export type GenericObject = Record<string, unknown>;

export type Key = number | string;

type KeyedDiffValue = {
	key: string;
} & DiffValue;

export type ValueObject = ArrayOrObject | Map<unknown, unknown>;

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

		if (!isArrayOrObject(value)) {
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

				changes.push({
					from,
					to,
					key: prefixed,
				});

				changes.push(..._getDiffs(from, to, prefixed));
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
	return structuredClone(value);
}

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

	const firstIsArrayOrObject = isArrayOrObject(first);
	const secondIsArrayOrObject = isArrayOrObject(second);

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
 * Is the value an array or a generic object?
 */
export function isArrayOrObject(value: unknown): value is ArrayOrObject {
	return /^(array|object)$/i.test((value as ArrayOrObject)?.constructor?.name);
}

/**
 * Is the value undefined or null?
 */
export function isNullable(value: unknown): value is undefined | null {
	return value == null;
}

/**
 * Is the value a generic object?
 */
export function isObject(value: unknown): value is GenericObject {
	return /^object$/i.test((value as GenericObject)?.constructor?.name);
}

/**
 * Merges multiple arrays or objects into a single one
 */
export function merge<T = ArrayOrObject>(...values: T[]): T {
	if (values.length === 0) {
		return {} as T;
	}

	const actual = values.filter(isArrayOrObject) as GenericObject[];
	const result = (actual.every(Array.isArray) ? [] : {}) as GenericObject;

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

			if (isArrayOrObject(next)) {
				result[key] = isArrayOrObject(previous)
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
