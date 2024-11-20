import type {PlainObject} from '../models';

/**
 * Create a new object with only the specified keys
 */
export function partial<Value extends PlainObject, Key extends keyof Value>(
	value: Value,
	keys: Key[],
): Pick<Value, Key> {
	const result = {} as Pick<Value, Key>;
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		result[key] = value[key];
	}

	return result;
}

export * from './clone';
export * from './compare';
export * from './diff';
export * from './equal';
export * from './get';
export * from './merge';
export * from './set';
export * from './smush';
export * from './unsmush';

