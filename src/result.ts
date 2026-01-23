import {isPlainObject} from './internal/is';

// #region Types

/**
 * An error result
 */
export type Err<Error> = {
	ok: false;
	error: Error;
};

/**
 * An extended error result
 */
export type ExtendedErr<E> = Err<E> & {
	original: Error;
};

/**
 * A successful result
 */
export type Ok<Value> = {
	ok: true;
	value: Value;
};

/**
 * An unknown result
 */
export type Result<Value, E = Error> = Err<E> | Ok<Value>;

// #endregion

// #region Functions

function _isResult(value: unknown, okValue: boolean): value is Result<unknown, unknown> {
	if (!isPlainObject(value)) {
		return false;
	}

	return value.ok === okValue && (okValue ? 'value' : 'error') in value;
}

/**
 * Creates an extended error result
 * @param error Error value
 * @param original Original error
 * @returns Error result
 */
export function error<E>(value: E, original: Error): ExtendedErr<E>;

/**
 * Creates an error result
 * @param error Error value
 * @returns Error result
 */
export function error<E>(value: E): Err<E>;

export function error<E>(value: E, original?: Error): Err<E> | ExtendedErr<E> {
	return getError(value, original);
}

function getError<E>(value: E, original?: Error): Err<E> | ExtendedErr<E> {
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
 * Executes a callback, catching any errors, and returns a result
 * @param callback Callback to execute
 * @param error Error value
 * @returns Callback result
 */
export function result<Value, E>(callback: () => Value, error: E): ExtendedErr<E> | Ok<Value>;

/**
 * Executes a callback, catching any errors, and returns a result
 * @param callback Callback to execute
 * @returns Callback result
 */
export function result<Value>(callback: () => Value): Result<Value, Error>;

export function result<Value, E>(
	callback: () => Value,
	err?: E,
): ExtendedErr<E> | Result<Value, E> {
	try {
		const value = callback();

		return ok(value);
	} catch (thrown) {
		return getError((err ?? thrown) as E, err == null ? undefined : (thrown as Error));
	}
}

result.async = asyncResult;

/**
 * Executes a callback asynchronously, catching any errors, and returns a result
 * @param callback Callback to execute
 * @param error Error value
 * @returns Callback result
 */
async function asyncResult<Value, E>(
	callback: () => Promise<Value>,
	error: E,
): Promise<ExtendedErr<E> | Ok<Value>>;

/**
 * Executes a callback asynchronously, catching any errors, and returns a result
 * @param callback Callback to execute
 * @returns Callback result
 */
async function asyncResult<Value>(callback: () => Promise<Value>): Promise<Result<Value>>;

async function asyncResult<Value, E>(
	callback: () => Promise<Value>,
	err?: E,
): Promise<Result<Value, E>> {
	try {
		const value = await callback();

		return ok(value);
	} catch (thrown) {
		return getError((err ?? thrown) as E, err == null ? undefined : (thrown as Error));
	}
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
