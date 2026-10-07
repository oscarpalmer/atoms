import {isNonPlainObject} from '../internal/is';
import type {PlainObject, Simplify} from '../models';

// #region Types

/**
 * A shaken object, without any `undefined` values
 */
export type Shaken<Value extends PlainObject> = Simplify<
	{
		[Key in keyof Value as undefined extends Value[Key] ? never : Key]: Value[Key];
	} & {
		[
			Key in keyof Value as undefined extends Value[Key]
				? [Value[Key]] extends [undefined]
					? never
					: Key
				: never
		]?: Exclude<Value[Key], undefined>;
	}
>;

// #endregion

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
