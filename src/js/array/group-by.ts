import type {KeyCallback} from '@/array/models';
import {getCallbacks} from '@/internal/array-callbacks';
import type {Key} from '@/models';

/**
 * Groups an array of items using a key or callback
 */
export function groupBy<Value>(
	array: Value[],
	key: Key | KeyCallback<Value>,
): Record<Key, Value[]> {
	return groupValues(array, key, true, false) as never;
}

export function groupValues<Value>(
	array: Value[],
	key: Key | KeyCallback<Value>,
	arrays: boolean,
	indicable: boolean,
): Record<Key, unknown> {
	const callbacks = getCallbacks(undefined, key);
	const hasCallback = typeof callbacks?.key === 'function';

	if (!hasCallback && !indicable) {
		return {};
	}

	const record: Record<Key, unknown> = {};
	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const value = array[index];

		const key = hasCallback
			? (callbacks?.key?.(value, index, array) ?? index)
			: index;

		if (arrays) {
			const existing = record[key];

			if (Array.isArray(existing)) {
				existing.push(value);
			} else {
				record[key] = [value];
			}
		} else {
			record[key] = value;
		}
	}

	return record;
}
