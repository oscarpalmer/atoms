import type {GenericCallback, PlainObject} from '../../models';

export type Callbacks = {
	bool?: GenericCallback;
	keyed?: GenericCallback;
	value?: GenericCallback;
};

function getCallback(value: unknown): GenericCallback | undefined {
	switch (typeof value) {
		case 'function':
			return value as GenericCallback;

		case 'number':
		case 'string':
			return typeof value === 'string' && value.includes('.')
				? undefined
				: (obj: PlainObject) => obj[value];
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
		keyed: getCallback(key),
		value: getCallback(value),
	};
}
