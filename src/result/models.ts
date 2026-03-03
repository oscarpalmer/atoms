import type {GenericCallback} from '../models';

// #region Types

/**
 * An unknown result
 */
export type AnyResult<Value, E> = Err<E> | ExtendedErr<E> | Ok<Value>;

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
 * An extended, unknown result
 */
export type ExtendedResult<Value, E> = ExtendedErr<E> | Ok<Value>;

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

/**
 * Match callbacks for a result
 */
export type ResultMatch<Value, Returned, E = Error> = {
	/**
	 * Callback for error result
	 * @param error Error value
	 * @param original Original error, if available
	 * @returns Value to return
	 */
	error: (error: E, original?: Error) => Returned;
	/**
	 * Callback for ok result
	 * @param value Ok value
	 * @returns Value to return
	 */
	ok: (value: Value) => Returned;
};

/**
 * Unwrap a result value
 */
type UnwrapResult<Original extends Result<unknown, unknown>> =
	Original extends Ok<infer Value> ? Value : never;

/**
 * Unwrap any value
 */
export type UnwrapValue<Original> = Original extends GenericCallback
	? ReturnType<Original> extends Result<unknown, unknown>
		? UnwrapResult<ReturnType<Original>>
		: ReturnType<Original>
	: Original extends Result<unknown, unknown>
		? UnwrapResult<Original>
		: Original extends Promise<infer Value>
			? Awaited<Value>
			: Original;

// #endregion
