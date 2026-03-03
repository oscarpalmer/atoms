import type {GenericCallback} from '../models';

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
