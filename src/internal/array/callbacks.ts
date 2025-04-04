import type {Callbacks} from '../../array/models';
import type {GenericCallback, PlainObject} from '../../models';

function getCallback(value: unknown): GenericCallback | undefined {
	switch (typeof value) {
		case 'function':
			return value as GenericCallback;

		case 'number':
		case 'string':
		case 'symbol':
			return typeof value === 'string' && value.includes('.')
				? undefined
				: (obj: PlainObject) => obj[value];

		default:
			return;
	}
}

export function getCallbacks(
	bool?: unknown,
	key?: unknown,
	value?: unknown,
): Callbacks | undefined {
	if (typeof bool === 'function') {
		return {bool: bool as GenericCallback};
	}

	return {
		key: getCallback(key),
		value: getCallback(value),
	};
}
