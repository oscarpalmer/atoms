import type {BooleanCallback, Callbacks, KeyCallback} from '../array/models';
import type {Key, PlainObject} from '../models';

export function getCallbacks<Value>(
	bool: unknown,
	key: unknown,
): Callbacks<Value> | undefined {
	if (typeof bool === 'function') {
		return {bool: bool as BooleanCallback<Value>};
	}

	if (typeof key === 'function') {
		return {key: key as KeyCallback<Value>};
	}

	const isString = typeof key === 'string';

	if (
		(!isString && typeof key !== 'number') ||
		(isString && key.includes('.'))
	) {
		return;
	}

	return {
		key: (value: Value) => (value as PlainObject)?.[key as string] as Key,
	};
}
