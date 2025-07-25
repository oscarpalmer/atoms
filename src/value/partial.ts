import type {PlainObject} from '../models';

/**
 * Create a new object with only the specified keys
 * @param value Object to create a partial object from
 * @param keys Keys to include in the partial object
 * @returns Partial object with only the specified keys
 */
export function partial<Value extends PlainObject, Key extends keyof Value>(
	value: Value,
	keys: Key[],
): Pick<Value, Key> {
	if (
		typeof value !== 'object' ||
		value === null ||
		Object.keys(value).length === 0 ||
		!Array.isArray(keys) ||
		keys.length === 0
	) {
		return {} as Pick<Value, Key>;
	}

	const result = {} as Pick<Value, Key>;
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		result[key] = value[key];
	}

	return result;
}
