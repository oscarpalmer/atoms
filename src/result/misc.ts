import {isOk, isResult} from '../internal/result';
import type {AnyResult, Err, ExtendedErr, Ok, Result} from './models';

// #region Functions

/**
 * Creates an extended error result
 * @param value Error value
 * @param original Original error
 * @returns Error result
 */
export function error<E>(value: E, original: Error): ExtendedErr<E>;

/**
 * Creates an error result
 * @param value Error value
 * @returns Error result
 */
export function error<E>(value: E): Err<E>;

export function error<E>(value: E, original?: Error): Err<E> | ExtendedErr<E> {
	return getError(value, original);
}

export function getError<E>(value: E, original?: Error): Err<E> | ExtendedErr<E> {
	const errorResult: Err<E> | ExtendedErr<E> = {
		error: value,
		ok: false,
	};

	if (original instanceof Error) {
		(errorResult as ExtendedErr<E>).original = original;
	}

	return errorResult;
}

/**
 * Creates an ok result
 * @param value Value
 * @returns Ok result
 */
export function ok<Value>(value: Value): Ok<Value> {
	return {
		ok: true,
		value,
	};
}

/**
 * Converts a result to a promise
 *
 * Resolves if ok, rejects for error
 * @param callback Callback to get the result
 * @returns Promised result
 */
export async function toPromise<Value, E = Error>(
	callback: () => AnyResult<Value, E>,
): Promise<Value>;

/**
 * Converts a result to a promise
 *
 * Resolves if ok, rejects for error
 * @param result Result to convert
 * @returns Promised result
 */
export async function toPromise<Value, E = Error>(result: AnyResult<Value, E>): Promise<Value>;

/**
 * Converts a result to a promise
 *
 * Resolves if ok, rejects for error
 * @param result Result to convert
 * @returns Promised result
 */
export async function toPromise<Value, E = Error>(
	result: AnyResult<Value, E> | (() => AnyResult<Value, E>),
): Promise<Value> {
	const actual = typeof result === 'function' ? result() : result;

	if (!isResult(actual)) {
		return Promise.reject(new Error(MESSAGE_PROMISE_RESULT));
	}

	return isOk(actual) ? Promise.resolve(actual.value) : Promise.reject(actual.error);
}

/**
 * Gets the value of an ok result _(or a default value)_
 * @param value Result to unwrap
 * @param defaultValue Default value
 * @returns Value of the result _(or the default value)_
 */
export function unwrap<Value, E = Error>(value: Result<Value, E>, defaultValue: Value): Value;

/**
 * Gets the value of an ok result _(or a default value)_
 * @param value Result to unwrap
 * @param defaultValue Default value
 * @returns Value of the result _(or the default value)_
 */
export function unwrap(value: unknown, defaultValue: unknown): unknown;

export function unwrap(value: unknown, defaultValue: unknown): unknown {
	return isOk(value) ? value.value : defaultValue;
}

// #endregion

// #region Variables

const MESSAGE_PROMISE_RESULT = 'toPromise expected to receive a Result';

// #endregion

// #region Exports

export {isError, isOk, isResult} from '../internal/result';

// #endregion
