import type {Key} from '../../models';
import {getCallbacks} from './callbacks';

export function groupValues(
	array: unknown[],
	key: unknown,
	value: unknown,
	arrays: boolean,
): Record<Key, unknown> {
	if (!Array.isArray(array) || array.length === 0) {
		return {};
	}

	const callbacks = getCallbacks(undefined, key, value);
	const record: Record<Key, unknown> = {};
	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		const keyed = callbacks?.keyed?.(item, index, array) ?? index;
		const valued = callbacks?.value?.(item, index, array) ?? item;

		if (arrays) {
			const existing = record[keyed];

			if (existing == null) {
				record[keyed] = [valued];
			} else {
				(existing as unknown[]).push(valued);
			}
		} else {
			record[keyed] = valued;
		}
	}

	return record;
}
