import type {GenericCallback, PlainObject} from '../../models';
import type {ArrayGetCallbacks} from '../../models/array/array.misc.model';

// #region Functions

export function getArrayCallback(value: unknown): GenericCallback | undefined {
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

export function getArrayCallbacks(
	bool?: unknown,
	key?: unknown,
	value?: unknown,
): ArrayGetCallbacks | undefined {
	if (typeof bool === 'function') {
		return {
			bool: bool as GenericCallback,
		};
	}

	return {
		keyed: getArrayCallback(key),
		value: getArrayCallback(value),
	};
}

// #endregion
