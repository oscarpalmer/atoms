import type {Get, Paths, Simplify} from 'type-fest';
import type {ToString} from 'type-fest/source/internal/string';
import {isArrayOrPlainObject} from '../is';
import type {ArrayOrPlainObject, PlainObject} from '../models';
import {join} from '../string/misc';

type Smushed<Value> = Simplify<{
	[Key in Paths<Value>]: Get<Value, ToString<Key>>;
}>;

function flatten(
	value: ArrayOrPlainObject,
	depth: number,
	smushed: WeakMap<WeakKey, PlainObject>,
	prefix?: string,
): PlainObject {
	if (depth >= 100) {
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
			Object.assign(flattened, {
				[join([prefix, key], '.')]: Array.isArray(val) ? [...val] : {...val},
				...flatten(val, depth + 1, smushed, join([prefix, key], '.')),
			});
		} else {
			flattened[join([prefix, key], '.')] = val;
		}
	}

	smushed.set(value, flattened);

	return flattened as never;
}

/**
 * Smush an object into a flat object that uses dot notation keys
 */
export function smush<Value extends PlainObject>(value: Value): Smushed<Value> {
	return typeof value === 'object' && value !== null
		? (flatten(value, 0, new WeakMap()) as never)
		: ({} as never);
}
