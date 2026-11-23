import {
	RESULT_ERROR_PROPERTY,
	RESULT_NAME_ERR,
	RESULT_NAME_OK,
	RESULT_NAMES_ALL,
	RESULT_OK_PROPERTY,
	RESULT_SYMBOL,
	type Err,
	type ErrLike,
	type Ok,
	type OkLike,
	type Result,
	type ResultLike,
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
 * Is the result similar to an error result?
 *
 * _Available as `isErrorLike` and `error.like`_
 *
 * @param result Result to check
 * @returns `true` if the result is similar to an error result, otherwise `false`
 */
export function isErrorLike<V = unknown, E = Error>(result: Result<V, E>): result is Err<V, E>;

/**
 * Is the value similar to an error result?
 *
 * _Available as `isErrorLike` and `error.like`_
 *
 * @param result Value to check
 * @returns `true` if the value is similar to an error result, otherwise `false`
 */
export function isErrorLike<E = Error>(value: unknown): value is ErrLike<E>;

export function isErrorLike(value: unknown): value is ErrLike<unknown> {
	return isResultLikeValue(value, RESULT_NAME_ERR);
}

export function isErrorLikeValue(value: object): value is ErrLike<unknown> {
	return (
		(value as ErrLike<unknown>).ok === false &&
		RESULT_ERROR_PROPERTY in value &&
		!(RESULT_OK_PROPERTY in value)
	);
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
 * Is the result similar to an ok result?
 *
 * _Available as `isOkLike` and `ok.like`_
 *
 * @param result Result to check
 * @returns `true` if the result is similar to an ok result, otherwise `false`
 */
export function isOkLike<V = unknown, E = Error>(result: Result<V, E>): result is Ok<V, E>;

/**
 * Is the value similar to an ok result?
 *
 * _Available as `isOkLike` and `ok.like`_
 *
 * @param value Value to check
 * @returns `true` if the value is similar to an ok result, otherwise `false`
 */
export function isOkLike<V = unknown>(value: unknown): value is OkLike<V>;

export function isOkLike(value: unknown): value is OkLike<unknown> {
	return isResultLikeValue(value, RESULT_NAME_OK);
}

export function isOkLikeValue(value: object): value is OkLike<unknown> {
	return (
		(value as OkLike<unknown>).ok === true &&
		RESULT_OK_PROPERTY in value &&
		!(RESULT_ERROR_PROPERTY in value)
	);
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

/**
 * Is the value similar to a result?
 *
 * @param value Value to check
 * @returns `true` if the value is similar to a result, otherwise `false`
 */
export function isResultLike<V = unknown, E = Error>(value: unknown): value is ResultLike<V, E> {
	return isResultLikeValue(value);
}

function isResultLikeValue(value: unknown, name?: string): boolean {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	if (RESULT_SYMBOL in value) {
		if (name == null) {
			return true;
		}

		return value[RESULT_SYMBOL] === name;
	}

	if (name != null) {
		return name === RESULT_NAME_OK ? isOkLikeValue(value) : isErrorLikeValue(value);
	}

	return isErrorLikeValue(value) || isOkLikeValue(value);
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
