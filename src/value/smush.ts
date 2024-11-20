import type {Get, Paths, Simplify} from 'type-fest';
import type {ToString} from 'type-fest/source/internal/string';
import {isArrayOrPlainObject} from '../is';
import type {ArrayOrPlainObject, PlainObject} from '../models';
import {join} from '../string/index';

type Smushed<Value> = Simplify<{
	[Key in Paths<Value>]: Get<Value, ToString<Key>>;
}>;

function flatten(value: ArrayOrPlainObject, prefix?: string): PlainObject {
	const keys = Object.keys(value);
	const {length} = keys;
	const smushed = {} as Record<string, unknown>;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const val = value[key as never];

		if (isArrayOrPlainObject(val)) {
			Object.assign(smushed, {
				[join([prefix, key], '.')]: Array.isArray(val) ? [...val] : {...val},
				...flatten(val, join([prefix, key], '.')),
			});
		} else {
			smushed[join([prefix, key], '.')] = val;
		}
	}

	return smushed as never;
}

/**
 * Smush an object into a flat object that uses dot notation keys
 */
export function smush<Value extends PlainObject>(value: Value): Smushed<Value> {
	return flatten(value) as never;
}
