import {partial} from '../internal/value/partial';
import type {PlainObject} from '../models';

// #region Functions

/**
 * Create a new object with only the specified keys
 * @param value Original object
 * @param keys Keys to use
 * @returns Partial object with only the specified keys
 */
export function pick<Value extends PlainObject, Key extends keyof Value>(
	value: Value,
	keys: Key[],
): Pick<Value, Key> {
	return partial(value, keys, false);
}

// #endregion
