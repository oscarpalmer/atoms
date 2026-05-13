import type {PlainObject} from '../models';
import type {Err, ExtendedErr, Ok, Result} from '../result/models';
import {isNonPlainObject} from './is';

// #region Functions

/**
 * Is the _Result_ an extended error?
 *
 * @param result _Result_ to check
 * @returns `true` if the _Result_ is an extended error, `false` otherwise
 */
export function isError<Value, E = Error>(
	result: ExtendedErr<E> | Result<Value, E>,
	extended: true,
): result is ExtendedErr<E>;

/**
 * Is the _Result_ an error?
 *
 * @param result _Result_ to check
 * @returns `true` if the _Result_ is an error, `false` otherwise
 */
export function isError<Value, E = Error>(result: Result<Value, E>): result is Err<E>;

/**
 * Is the value an error?
 *
 * @param value Value to check
 * @returns `true` if the value is an error, `false` otherwise
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
 * @param value _Result_ to check
 * @returns `true` if the _Result_ is ok, `false` otherwise
 */
export function isOk<Value, E = Error>(value: Result<Value, E>): value is Ok<Value>;

/**
 * Is the value ok?
 *
 * @param value Value to check
 * @returns `true` if the value is ok, `false` otherwise
 */
export function isOk(value: unknown): value is Ok<unknown>;

export function isOk(value: unknown): value is Ok<unknown> {
	return isResultValue(value, true);
}

/**
 * Is the value a _Result_?
 *
 * @param value Value to check
 * @returns `true` if the value is a _Result_, `false` otherwise
 */
export function isResult(value: unknown): value is ExtendedErr<unknown> | Result<unknown, unknown> {
	return isResultValue(value, true) || isResultValue(value, false);
}

function isResultValue(value: unknown, okValue: boolean): value is Result<unknown, unknown> {
	if (isNonPlainObject(value)) {
		return false;
	}

	return (
		(value as PlainObject).ok === okValue && (okValue ? PROPERTY_VALUE : PROPERTY_ERROR) in value
	);
}

// #endregion

// #region Variable

const PROPERTY_ERROR = 'error';

const PROPERTY_VALUE = 'value';

// #endregion
