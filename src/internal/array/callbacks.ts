import type {GenericCallback, PlainObject} from '../../models';

export type Callbacks = {
	bool?: GenericCallback;
	keyed?: GenericCallback;
	value?: GenericCallback;
};

function getArrayCallback(value: unknown): GenericCallback | undefined {
	switch (typeof value) {
		case 'function':
			return value as GenericCallback;

		case 'number':
		case 'string':
			return typeof value === 'string' && value.includes('.')
				? undefined
				: (obj: PlainObject) => obj[value];

		default:
			break;
	}
}

export function getArrayCallbacks(
	bool?: unknown,
	key?: unknown,
	value?: unknown,
): Callbacks | undefined {
	if (typeof bool === 'function') {
		return {bool: bool as GenericCallback};
	}

	return {
		keyed: getArrayCallback(key),
		value: getArrayCallback(value),
	};
}
