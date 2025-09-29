import type {PlainObject} from '../models';

/**
 * Create a new object with only the specified keys
 * @param value Original object
 * @param keys Keys to use
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

	const {length} = keys;
	const result = {} as Pick<Value, Key>;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		result[key] = value[key];
	}

	return result;
}
