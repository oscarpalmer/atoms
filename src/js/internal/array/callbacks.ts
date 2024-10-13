import type {BooleanCallback, Callbacks, KeyCallback} from '~/array/models';
import type {GenericCallback, PlainObject} from '~/models';

function getCallback(value: unknown): GenericCallback | undefined {
	switch (typeof value) {
		case 'function':
			return value as GenericCallback;

		case 'number':
		case 'string':
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
		return {bool: bool as BooleanCallback<unknown>};
	}

	return {
		key: getCallback(key) as KeyCallback<unknown>,
		value: getCallback(value) as GenericCallback,
	};
}
