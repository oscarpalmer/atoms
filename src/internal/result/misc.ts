import {isPlainObject} from '../is';
import type {Err, ExtendedErr, Ok, Result} from './models';

// #region Functions

/**
 * Creates an extended error result
 *
 * @param value Error value
 * @param original Original error
 * @returns Error result
 */
export function error<E>(value: E, original: Error): ExtendedErr<E>;

/**
 * Creates an error result
 *
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
 * Is the _Result_ an extended error?
 *
 * _Available as `isError` and `error.is`_
 *
 * @param result _Result_ to check
 * @returns `true` if the _Result_ is an extended error, otherwise `false`
 */
export function isError<Value, E = Error>(
	result: ExtendedErr<E> | Result<Value, E>,
	extended: true,
): result is ExtendedErr<E>;

/**
 * Is the _Result_ an error?
 *
 * _Available as `isError` and `error.is`_
 *
 * @param result _Result_ to check
 * @returns `true` if the _Result_ is an error, otherwise `false`
 */
export function isError<Value, E = Error>(result: Result<Value, E>): result is Err<E>;

/**
 * Is the value an error?
 *
 * _Available as `isError` and `error.is`_
 *
 * @param value Value to check
 * @returns `true` if the value is an error, otherwise `false`
 */
export function isError(value: unknown): value is Err<unknown> | ExtendedErr<unknown>;

export function isError(
	value: unknown,
	extended?: boolean,
): value is Err<unknown> | ExtendedErr<unknown> {
	return (
		isResultValue(value, false) &&
		(extended === true ? (value as ExtendedErr<unknown>).original instanceof Error : true)
	);
}

/**
 * Is the _Result_ ok?
 *
 * _Available as `isOk` and `ok.is`_
 *
 * @param value _Result_ to check
 * @returns `true` if the _Result_ is ok, otherwise `false`
 */
export function isOk<Value, E = Error>(value: Result<Value, E>): value is Ok<Value>;

/**
 * Is the value ok?
 *
 * _Available as `isOk` and `ok.is`_
 *
 * @param value Value to check
 * @returns `true` if the value is ok, otherwise `false`
 */
export function isOk(value: unknown): value is Ok<unknown>;

export function isOk(value: unknown): value is Ok<unknown> {
	return isResultValue(value, true);
}

/**
 * Is the value a _Result_?
 *
 * @param value Value to check
 * @returns `true` if the value is a _Result_, otherwise `false`
 */
export function isResult(value: unknown): value is ExtendedErr<unknown> | Result<unknown, unknown> {
	return isResultValue(value, true) || isResultValue(value, false);
}

function isResultValue(value: unknown, okValue: boolean): value is Result<unknown, unknown> {
	return (
		isPlainObject(value) &&
		value.ok === okValue &&
		(okValue ? RESULT_PROPERTY_VALUE : RESULT_PROPERTY_ERROR) in value
	);
}

/**
 * Creates an ok result
 *
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
 * Gets the value of an ok result _(or a default value)_
 *
 * @param value _Result_ to unwrap
 * @param defaultValue Default value
 * @returns Value of the _Result_ _(or the default value)_
 */
export function unwrap<Value, E = Error>(value: Result<Value, E>, defaultValue: Value): Value;

/**
 * Gets the value of an ok result _(or a default value)_
 *
 * @param value _Result_ to unwrap
 * @param defaultValue Default value
 * @returns Value of the _Result_ _(or the default value)_
 */
export function unwrap(value: unknown, defaultValue: unknown): unknown;

export function unwrap(value: unknown, defaultValue: unknown): unknown {
	return isOk(value) ? value.value : defaultValue;
}

// #endregion

// #region Variable

const RESULT_PROPERTY_ERROR = 'error';

const RESULT_PROPERTY_VALUE = 'value';

// #endregion

// #region Initialization

error.is = isError;
ok.is = isOk;

// #endregion
