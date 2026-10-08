import {isArrayOrPlainObject} from '../internal/is';
import {setValue} from '../internal/value/set';
import type {PlainObject} from '../models/index';
import type {Unsmushed, UnsmushedKey} from '../models/value/value.misc.model';

// #region Types

// #endregion

// #region Functions

function getKeys(value: PlainObject): UnsmushedKey[] {
	const keys = Object.keys(value);
	const {length} = keys;

	const orderedKeys: UnsmushedKey[] = [];

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		orderedKeys.push({
			order: key.split('.').length,
			value: key,
		});
	}

	return orderedKeys.sort((first, second) => first.order - second.order);
}

/**
 * Unsmush a smushed object _(turning dot notation keys into nested keys)_
 *
 * @param value Object to unsmush
 * @returns Unsmushed object with nested keys
 */
export function unsmush<Value extends PlainObject>(value: Value): Unsmushed<Value> {
	if (typeof value !== 'object' || value === null) {
		return {} as never;
	}

	const keys = getKeys(value);
	const {length} = keys;
	const unsmushed: PlainObject = {};

	for (let index = 0; index < length; index += 1) {
		const key = keys[index].value;
		const val = value[key];

		let next = val;

		if (isArrayOrPlainObject(val)) {
			next = Array.isArray(val) ? val.slice() : {...val};
		}

		setValue(unsmushed, key, next);
	}

	return unsmushed as never;
}

// #endregion

// #region Exports

export type {Unsmushed};

// #endregion
