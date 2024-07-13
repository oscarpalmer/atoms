import type {BooleanCallback, FindType, KeyCallback} from '../array/models';
import type {Key} from '../models';
import {getCallbacks} from './array-callbacks';

export function findValue<Model, Value = Model>(
	type: FindType,
	array: Model[],
	value: Value | BooleanCallback<Model>,
	key?: Key | KeyCallback<Model>,
): unknown {
	const callbacks = getCallbacks(value, key);

	if (callbacks?.bool == null && callbacks?.key == null) {
		return type === 'index'
			? array.indexOf(value as Model)
			: array.find(item => item === value);
	}

	if (callbacks.bool != null) {
		const index = array.findIndex(callbacks.bool);

		return type === 'index' ? index : index > -1 ? array[index] : undefined;
	}

	const {length} = array;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		if (callbacks.key?.(item, index, array) === value) {
			return type === 'index' ? index : item;
		}
	}

	return type === 'index' ? -1 : undefined;
}

export function findValues<Model, Value = Model>(
	type: 'all' | 'unique',
	array: Model[],
	value: Value | BooleanCallback<Model>,
	key?: Key | KeyCallback<Model>,
): Model[] {
	const callbacks = getCallbacks(value, key);

	const {length} = array;

	if (type === 'unique' && callbacks?.key == null && length >= 100) {
		return Array.from(new Set(array));
	}

	if (typeof callbacks?.bool === 'function') {
		return array.filter(callbacks.bool);
	}

	if (type === 'all' && key == null) {
		return array.filter(item => item === value);
	}

	const hasCallback = typeof callbacks?.key === 'function';
	const result: Model[] = [];
	const values: unknown[] = hasCallback ? [] : result;

	for (let index = 0; index < length; index += 1) {
		const item = array[index];
		const itemKey = hasCallback ? callbacks.key?.(item, index, array) : item;

		if (
			(type === 'all' && itemKey === value) ||
			(type === 'unique' && values.indexOf(itemKey) === -1)
		) {
			if (values !== result) {
				values.push(itemKey);
			}

			result.push(item);
		}
	}

	return result;
}
