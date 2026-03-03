import {isOk} from '../internal/result';
import {attemptPromise} from '../promise';
import {matchResult} from './match';
import type {Err, ExtendedErr, ExtendedResult, Ok, Result} from './models';
import {attemptFlow} from './work/flow';
import {attemptPipe} from './work/pipe';

// #region Functions

/**
 * Executes a promise, catching any errors, and returns a result
 * @param promise Promise to execute
 * @param error Error value
 * @returns Callback result
 */
async function asyncAttempt<Value, E>(
	promise: Promise<Value>,
	error: E,
): Promise<ExtendedResult<Awaited<Value>, E>>;

/**
 * Executes a callback asynchronously, catching any errors, and returns a result
 * @param callback Callback to execute
 * @param error Error value
 * @returns Callback result
 */
async function asyncAttempt<Value, E>(
	callback: () => Promise<Value>,
	error: E,
): Promise<ExtendedResult<Awaited<Value>, E>>;

/**
 * Executes a promise, catching any errors, and returns a result
 * @param promise Promise to execute
 * @returns Callback result
 */
async function asyncAttempt<Value>(promise: Promise<Value>): Promise<Result<Awaited<Value>>>;

/**
 * Executes a callback asynchronously, catching any errors, and returns a result
 * @param callback Callback to execute
 * @returns Callback result
 */
async function asyncAttempt<Value>(callback: () => Promise<Value>): Promise<Result<Awaited<Value>>>;

async function asyncAttempt<Value, E>(
	value: Promise<Value> | (() => Promise<Value>),
	err?: E,
): Promise<unknown> {
	try {
		let result = typeof value === 'function' ? value() : await value;

		if (result instanceof Promise) {
			result = await result;
		}

		return ok(result);
	} catch (thrown) {
		return getError((err ?? thrown) as E, err == null ? undefined : (thrown as Error));
	}
}

/**
 * Executes a callback, catching any errors, and returns a result
 * @param callback Callback to execute
 * @param error Error value
 * @returns Callback result
 */
export function attempt<Value, E>(callback: () => Value, error: E): ExtendedResult<Value, E>;

/**
 * Executes a callback, catching any errors, and returns a result
 * @param callback Callback to execute
 * @returns Callback result
 */
export function attempt<Value>(callback: () => Value): Result<Value, Error>;

export function attempt<Value, E>(
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

attempt.async = asyncAttempt;
attempt.flow = attemptFlow;
attempt.match = matchResult;
attempt.pipe = attemptPipe;
attempt.promise = attemptPromise;

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

// #region Exports

export {isError, isOk, isResult} from '../internal/result';
export type {Err, ExtendedErr, ExtendedResult, Ok, Result} from './models';

// #endregion
