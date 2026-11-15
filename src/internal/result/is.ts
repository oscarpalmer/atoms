import {
	RESULT_NAME_ERR,
	RESULT_NAME_OK,
	RESULT_NAMES_ALL,
	RESULT_SYMBOL,
	type Err,
	type Ok,
	type Result,
} from '../../models/result.model';

// #region Functions

/**
 * Is the result an error?
 *
 * _Available as `isError` and `error.is`_
 *
 * @param result Result to check
 * @returns `true` if the result is an error, otherwise `false`
 */
export function isError<V = unknown, E = Error>(result: Result<V, E>): result is Err<V, E>;

/**
 * Is the value a result error?
 *
 * _Available as `isError` and `error.is`_
 *
 * @param result Value to check
 * @returns `true` if the value is a result error, otherwise `false`
 */
export function isError<V = unknown, E = Error>(value: unknown): value is Err<V, E>;

export function isError(value: unknown): value is Err<unknown, unknown> {
	return isResultValue(RESULT_NAME_ERR, value);
}

/**
 * Is the result ok?
 *
 * _Available as `isOk` and `ok.is`_
 *
 * @param result Result to check
 * @returns `true` if the result is ok, otherwise `false`
 */
export function isOk<V = unknown, E = Error>(result: Result<V, E>): result is Ok<V, E>;

/**
 * Is the value an ok result?
 *
 * _Available as `isOk` and `ok.is`_
 *
 * @param value Value to check
 * @returns `true` if the value is an ok result, otherwise `false`
 */
export function isOk<V = unknown, E = Error>(value: unknown): value is Ok<V, E>;

export function isOk(value: unknown): value is Ok<unknown, unknown> {
	return isResultValue(RESULT_NAME_OK, value);
}

/**
 * Is the value a result?
 *
 * @param value Value to check
 * @returns `true` if the value is a result, otherwise `false`
 */
export function isResult<V = unknown, E = Error>(value: unknown): value is Result<V, E> {
	return isResultValue(RESULT_NAMES_ALL, value);
}

function isResultValue(
	name: string | Set<string>,
	value: unknown,
): value is Result<unknown, unknown> {
	return (
		typeof value === 'object' &&
		value !== null &&
		RESULT_SYMBOL in value &&
		(typeof name === 'string'
			? value[RESULT_SYMBOL] === name
			: name.has(value[RESULT_SYMBOL] as string))
	);
}

// #endregion
