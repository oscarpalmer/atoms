import {partial} from '../internal/value/partial';
import type {PlainObject} from '../models';

// #region Functions

/**
 * Create a new object without the specified keys
 * @param value Original object
 * @param keys Keys to omit
 * @returns Partial object without the specified keys
 */
export function omit<Value extends PlainObject, ValueKey extends keyof Value>(
	value: Value,
	keys: ValueKey[],
): Omit<Value, ValueKey> {
	return partial(value, keys, true);
}

// #endregion
