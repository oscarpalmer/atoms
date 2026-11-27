import type {ErrorJson} from '../models/misc.model';
import {isInstanceOfConstructor} from './is';

// #region Functions

function hasToJson(value: unknown): value is {toJSON: () => unknown} {
	return (
		typeof value === 'object' &&
		value !== null &&
		'toJSON' in value &&
		typeof (value as any).toJSON === 'function'
	);
}

function jsonifyError(input: unknown, set: Set<Error>): unknown {
	if (!isInstanceOfConstructor(Error, input)) {
		return hasToJson(input) ? input.toJSON() : input;
	}

	if (set.has(input)) {
		return undefined;
	}

	if (hasToJson(input)) {
		return input.toJSON();
	}

	set.add(input);

	return {
		cause: jsonifyError(input.cause, set),
		message: input.message,
		name: input.name,
	};
}

/**
 * Get the _JSON_ representation of an error value
 *
 * @param error Original error value
 * @returns _JSON_ representation
 */
export function toJsonError(error: unknown): unknown {
	return jsonifyError(error, new Set());
}

/**
 * @internal
 */
export function toPojoError(error: Error): ErrorJson {
	return {
		cause: toJsonError(error.cause),
		message: error.message,
		name: error.name,
	};
}

// #endregion
