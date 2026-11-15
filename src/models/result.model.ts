import type {GenericCallback} from './index';

// #region Special variables

declare const CHECKED: unique symbol;

// #endregion

// #region Types

/**
 * A synchronous _Flow_, a function that attempts to pipe values through a series of functions
 */
export type AttemptFlow<Callback extends GenericCallback, V, E = Error> = (
	...args: Parameters<Callback>
) => Result<UnwrapValue<V>, E>;

/**
 * An asynchronous _Flow_, a function that attempts to pipe values through a series of functions
 */
export type AttemptAsyncFlow<Callback extends GenericCallback, V, E = Error> = (
	...args: Parameters<Callback>
) => Promise<Result<UnwrapValue<V>, E>>;

type CheckedResult = {readonly [CHECKED]: true};

/**
 * An error result
 */
export type Err<V, E> = {
	[RESULT_SYMBOL]: typeof RESULT_NAME_ERR;

	/**
	 * Error value
	 */
	readonly error: E;

	/**
	 * Result is an error
	 */
	readonly ok: false;

	/**
	 * Get a new result based on the current value
	 *
	 * _As this is an error result, the error itself will be returned unchanged_
	 *
	 * @param next Next result value, or a callback that returns it
	 * @returns Same error result
	 */
	and<Next>(next: ((value: V) => Next) | Next): ErrAndResult<Awaited<Next>, E>;

	isError: IsError<V, E>;

	isOk: IsOk<V, E>;

	/**
	 * Map the result into another result
	 *
	 * _As this is an error result, the error itself will be returned unchanged_
	 *
	 * @param mapper Mapping callback for the value
	 * @returns Same error result
	 */
	map<Mapped>(mapper: (value: V) => Mapped): Err<Awaited<Mapped>, E>;

	/**
	 * Map the result into another result
	 *
	 * @param mapper Mapping callback for the error
	 * @returns Mapped result
	 */
	mapError<Mapped>(mapper: (error: E) => Mapped): ErrMapped<V, Mapped>;

	match: Matchers<V, E>;

	/**
	 * Get a new result based on the current error
	 *
	 * @param next Value to return as result, or a callback that returns it
	 * @returns Next result
	 */
	or<Next>(next: ((error: E) => Next) | Next): ErrOrResult<Next>;

	/**
	 * Unwrap the error result with a fallback
	 *
	 * _Throws if no fallback is given_
	 *
	 * @param next Fallback value for the error, or a callback that returns it
	 * @returns Fallback result
	 */
	unwrap<Next = never>(next?: ((error: E) => Next) | Next): Next;

	/**
	 * Iterator for the result
	 */
	[Symbol.iterator](): Generator<Err<never, E>, never, unknown>;

	/**
	 * Asynchronous iterator for the result
	 */
	[Symbol.asyncIterator](): AsyncGenerator<Err<never, E>, never, unknown>;
};

type ErrAndResult<Next, E> = [Next] extends [Result<infer NV, infer NE>]
	? Err<NV, E | NE>
	: Err<Next, E>;

type ErrMapped<V, M> = [M] extends [Promise<infer P>] ? Promise<Err<V, P>> : Err<V, M>;

type ErrOrResult<Next> = [Next] extends [Promise<infer P>]
	? Promise<ErrOrResultValue<P>>
	: ErrOrResultValue<Next>;

type ErrOrResultValue<Next> = [Next] extends [Result<infer NV, infer NE>]
	? Result<NV, NE>
	: Ok<Next>;

interface IsError<V, E> {
	/**
	 * Is the result an error?
	 *
	 * @returns `true` if the result is an error, otherwise `false`
	 */
	(): this is Err<V, E>;

	/**
	 * Is the result a narrowed error?
	 *
	 * @param predicate Predicate to narrow the error type
	 * @returns `true` if the result is a narrowed error, otherwise `false`
	 */
	<Narrowed extends E>(predicate: (error: E) => error is Narrowed): this is Err<V, Narrowed>;

	/**
	 * Is the result an error based on the given predicate
	 *
	 * @param predicate Predicate to check the error
	 * @returns `true` if the result satisfies the predicate, otherwise `false`
	 */
	(predicate: (error: E) => boolean): this is Err<V, E> & CheckedResult;
}

interface IsOk<V, E> {
	/**
	 * Is the result an ok result?
	 *
	 * @returns `true` if the result is ok, otherwise `false`
	 */
	(): this is Ok<V, E>;

	/**
	 * Is the result an ok result based on the given predicate
	 *
	 * @param predicate Predicate to narrow the value type
	 * @returns `true` if the result satisfies the predicate, otherwise `false`
	 */
	<Narrowed extends V>(predicate: (value: V) => value is Narrowed): this is Ok<Narrowed, E>;

	/**
	 * Is the result an ok result based on the given predicate
	 *
	 * @param predicate Predicate to check the value
	 * @returns `true` if the result satisfies the predicate, otherwise `false`
	 */
	(predicate: (value: V) => boolean): this is Ok<V, E> & CheckedResult;
}

type Matchers<V, E> = {
	/**
	 * Match the result with ok and error handlers, called based on the result type
	 *
	 * @param ok Callback for the ok result
	 * @param error Callback for the error result
	 * @returns Matched result
	 */
	<Next, Nope>(ok: (value: V) => Next, error: (error: E) => Nope): Next | Nope;

	/**
	 * Match the result with ok and error handlers, called based on the result type
	 *
	 * @param matchers Match callbacks
	 * @returns Matched result
	 */
	<Next, Nope>(matchers: ResultMatch<V, E, Next, Nope>): Next | Nope;
};

/**
 * A successful result
 */
export type Ok<V, E = never> = {
	[RESULT_SYMBOL]: typeof RESULT_NAME_OK;

	/**
	 * Result is ok
	 */
	readonly ok: true;

	/**
	 * Ok value
	 */
	readonly value: V;

	/**
	 * Get the next result based on the current value
	 *
	 * @param next Next result value, or a callback that returns it
	 * @returns Next result
	 */
	and<Next>(next: ((value: V) => Next) | Next): OkAndResult<Next, E>;

	isError: IsError<V, E>;

	isOk: IsOk<V, E>;

	/**
	 * Map the result into another result
	 *
	 * @param mapper Mapping callback for the value
	 * @returns Mapped result
	 */
	map<Mapped>(mapper: (value: V) => Mapped): OkMapped<Mapped, E>;

	/**
	 * Map the result into another result
	 *
	 * _As this is an ok result, the value itself will be returned unchanged_
	 *
	 * @param mapper Mapping callback for the error
	 * @returns Same ok result
	 */
	mapError<Mapped>(mapper: (error: E) => Mapped): Ok<V, Awaited<Mapped>>;

	match: Matchers<V, E>;

	/**
	 * Get a new result based on the current error
	 *
	 * _As this is an ok result, the value itself will be returned unchanged_
	 *
	 * @param next Value to return as result, or a callback that returns it
	 * @returns Same ok result
	 */
	or<Next>(next: ((error: E) => Next) | Next): Ok<V, E>;

	/**
	 * Unwrap the ok result, returning its value
	 *
	 * _As this is an ok result, any fallback is ignored_
	 *
	 * @param next Fallback value for the error, or a callback that returns it
	 * @returns Ok result value
	 */
	unwrap<Next = never>(next?: ((error: E) => Next) | Next): V;

	/**
	 * Iterator for the result
	 */
	[Symbol.iterator](): Generator<Err<never, E>, V, unknown>;

	/**
	 * Asynchronous iterator for the result
	 */
	[Symbol.asyncIterator](): AsyncGenerator<Err<never, E>, never, unknown>;
};

type OkAndResult<Next, E> = [Next] extends [Promise<infer P>]
	? Promise<OkAndResultValue<P, E>>
	: OkAndResultValue<Next, E>;

type OkAndResultValue<Next, E> = [Next] extends [Result<infer NV, infer NE>]
	? Result<NV, E | NE>
	: Ok<Next, E>;

type OkMapped<M, E> = [M] extends [Promise<infer P>] ? Promise<Ok<P, E>> : Ok<M, E>;

/**
 * An unknown result
 */
export type Result<V, E = Error> = Err<V, E> | Ok<V, E>;

/**
 * Match callbacks for a result
 */
export type ResultMatch<V, E = Error, Next = unknown, Nope = unknown> = {
	/**
	 * Callback for error result
	 *
	 * @param error Error value
	 * @returns Value to return
	 */
	error(error: E): Nope;
	/**
	 * Callback for ok result
	 *
	 * @param value Ok value
	 * @returns Value to return
	 */
	ok(value: V): Next;
};

/**
 * Unwrap a result value
 */
type UnwrapResult<Original extends Result<unknown, unknown>> =
	Original extends Ok<infer V, unknown> ? V : never;

/**
 * Unwrap any value
 */
export type UnwrapValue<Original> = Original extends GenericCallback
	? ReturnType<Original> extends Result<unknown, unknown>
		? UnwrapResult<ReturnType<Original>>
		: ReturnType<Original>
	: Original extends Result<unknown, unknown>
		? UnwrapResult<Original>
		: Original extends Promise<infer V>
			? Awaited<V>
			: Original;

// #endregion

// #region Variables

export const RESULT_MESSAGE_ATTEMPT =
	'`attempt` expected a promise or a function that returns a value';

export const RESULT_MESSAGE_MATCH_ERROR = '`result.match` expected an Error callback';

export const RESULT_MESSAGE_MATCH_OK = '`result.match` expected an Ok callback';

export const RESULT_MESSAGE_MATCH_RESULT =
	'`result.match` expected a Result or a function that returns a Result';

export const RESULT_MESSAGE_UNWRAP = '`result.unwrap` expected an Ok result or a fallback';

export const RESULT_NAME_ERR = 'error';

export const RESULT_NAME_OK = 'ok';

export const RESULT_NAMES_ALL: Set<string> = new Set([RESULT_NAME_ERR, RESULT_NAME_OK]);

export const RESULT_SYMBOL: unique symbol = Symbol('result');

// #endregion
