import {isArrayOrPlainObject} from '../internal/is';
import {join} from '../internal/string';
import type {
	ArrayOrPlainObject,
	NestedKeys,
	NestedValue,
	PlainObject,
	Simplify,
	ToString,
} from '../models';

type Smushed<Value extends PlainObject> = Simplify<{
	[Key in NestedKeys<Value>]: NestedValue<Value, ToString<Key>>;
}>;

function flattenObject(
	value: ArrayOrPlainObject,
	depth: number,
	smushed: WeakMap<WeakKey, PlainObject>,
	prefix?: string,
): PlainObject {
	if (depth >= MAX_DEPTH) {
		return {};
	}

	if (smushed.has(value)) {
		return smushed.get(value) as never;
	}

	const keys = Object.keys(value);
	const {length} = keys;
	const flattened = {} as Record<string, unknown>;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const val = value[key as never];

		if (isArrayOrPlainObject(val)) {
			const prefixedKey = join([prefix, key], '.');

			flattened[prefixedKey] = Array.isArray(val) ? [...val] : {...val};

			const nested = flattenObject(val, depth + 1, smushed, prefixedKey);
			const nestedKeys = Object.keys(nested);
			const nestedLength = nestedKeys.length;

			for (let nestedIndex = 0; nestedIndex < nestedLength; nestedIndex += 1) {
				const nestedKey = nestedKeys[nestedIndex];

				flattened[nestedKey] = nested[nestedKey];
			}
		} else {
			flattened[join([prefix, key], '.')] = val;
		}
	}

	smushed.set(value, flattened);

	return flattened as never;
}

/**
 * Smush an object into a flat object that uses dot notation keys
 * @param value Object to smush
 * @returns Smushed object with dot notation keys
 */
export function smush<Value extends PlainObject>(value: Value): Smushed<Value> {
	return typeof value === 'object' && value !== null
		? (flattenObject(value, 0, new WeakMap()) as never)
		: ({} as never);
}

//

const MAX_DEPTH = 100;
