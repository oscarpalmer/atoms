import {isNonPlainObject} from '../internal/is';
import type {PlainObject} from '../models';
import type {Shaken} from '../models/value/value.misc.model';

// #region Functions

/**
 * Shake an object, removing all keys with `undefined` values
 *
 * @param value Object to shake
 * @returns Shaken object
 */
export function shake<Value extends PlainObject>(value: Value): Shaken<Value> {
	const shaken: PlainObject = {};

	if (isNonPlainObject(value)) {
		return shaken as Shaken<Value>;
	}

	const keys = Object.keys(value) as (keyof Value)[];
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const val = value[key];

		if (val !== undefined) {
			shaken[key] = val;
		}
	}

	return shaken as Shaken<Value>;
}

// #endregion

// #region Exports

export type {Shaken};

// #endregion
