import type {Err, ExtendedErr, Ok, Result} from '../result/models';
import {isPlainObject} from './is';

// #region Functions

function _isResult(value: unknown, okValue: boolean): value is Result<unknown, unknown> {
	if (!isPlainObject(value)) {
		return false;
	}

	return value.ok === okValue && (okValue ? 'value' : 'error') in value;
}

/**
 * Is the result an extended error?
 * @param result Result to check
 * @returns `true` if the result is an extended error, `false` otherwise
 */
export function isError<Value, E = Error>(
	value: ExtendedErr<E> | Result<Value, E>,
	extended: true,
): value is ExtendedErr<E>;

/**
 * Is the result an error?
 * @param result Result to check
 * @returns `true` if the result is an error, `false` otherwise
 */
export function isError<Value, E = Error>(value: Result<Value, E>): value is Err<E>;

/**
 * Is the value an error?
 * @param value Value to check
 * @returns `true` if the value is an error, `false` otherwise
 */
export function isError(value: unknown): value is Err<unknown> | ExtendedErr<unknown>;

export function isError(
	value: unknown,
	extended?: boolean,
): value is Err<unknown> | ExtendedErr<unknown> {
	return (
		_isResult(value, false) &&
		(extended === true ? (value as ExtendedErr<unknown>).original instanceof Error : true)
	);
}

/**
 * Is the result ok?
 * @param value Result to check
 * @returns `true` if the result is ok, `false` otherwise
 */
export function isOk<Value, E = Error>(value: Result<Value, E>): value is Ok<Value>;

/**
 * Is the value ok?
 * @param value Value to check
 * @returns `true` if the value is ok, `false` otherwise
 */
export function isOk(value: unknown): value is Ok<unknown>;

/**
 * Is the result ok?
 * @param result Result to check
 * @returns `true` if the result is ok, `false` otherwise
 */
export function isOk(value: unknown): value is Ok<unknown> {
	return _isResult(value, true);
}

/**
 * Is the value a result?
 * @param value Value to check
 * @returns `true` if the value is a result, `false` otherwise
 */
export function isResult(value: unknown): value is ExtendedErr<unknown> | Result<unknown, unknown> {
	return _isResult(value, true) || _isResult(value, false);
}

// #endregion
