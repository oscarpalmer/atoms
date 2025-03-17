import type {ArrayOrPlainObject, PlainObject} from '../../models';
import {ignoreKey} from '../string/key';

function findKey(
	needle: string,
	haystack: ArrayOrPlainObject,
	ignoreCase: boolean,
): string {
	if (!ignoreCase) {
		return needle;
	}

	const keys = Object.keys(haystack);
	const normalized = keys.map(key => key.toLowerCase());
	const index = normalized.indexOf(needle.toLowerCase());

	return index > -1 ? keys[index] : needle;
}

export function handleValue(
	data: ArrayOrPlainObject,
	path: string,
	value: unknown,
	get: boolean,
	ignoreCase: boolean,
): unknown {
	if (typeof data === 'object' && data !== null && !ignoreKey(path)) {
		const key = findKey(path, data, ignoreCase);

		if (get) {
			return data[key as never];
		}

		(data as PlainObject)[key] = value;
	}
}

//
