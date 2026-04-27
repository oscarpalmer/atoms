import {isNonPlainObject} from '../is';
import type {PlainObject} from '../models';

// #region Types

export type Shaken<Value extends PlainObject> = {
	[Key in keyof Value]: Value[Key] extends undefined ? never : Value[Key];
};

// #endregion

// #region Functions

/**
 * Shake an object, removing all keys with `undefined` values
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
