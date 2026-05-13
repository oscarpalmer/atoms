import {getError, ok} from './misc';
import type {ExtendedErr, ExtendedResult, Result} from './models';

// #region Functions

/**
 * Executes a _Promise_, catching any errors, and returns a result
 *
 * _Available as `asyncAttempt` and `attempt.async`_
 *
 * @param promise _Promise_ to execute
 * @param error Error value
 * @returns Callback result
 */
export async function asyncAttempt<Value, E>(
	promise: Promise<Value>,
	error: E,
): Promise<ExtendedResult<Awaited<Value>, E>>;

/**
 * Executes a callback asynchronously, catching any errors, and returns a result
 *
 * _Available as `asyncAttempt` and `attempt.async`_
 *
 * @param callback Callback to execute
 * @param error Error value
 * @returns Callback result
 */
export async function asyncAttempt<Value, E>(
	callback: () => Promise<Value>,
	error: E,
): Promise<ExtendedResult<Awaited<Value>, E>>;

/**
 * Executes a _Promise_, catching any errors, and returns a result
 *
 * _Available as `asyncAttempt` and `attempt.async`_
 *
 * @param promise _Promise_ to execute
 * @returns Callback result
 */
export async function asyncAttempt<Value>(promise: Promise<Value>): Promise<Result<Awaited<Value>>>;

/**
 * Executes a callback asynchronously, catching any errors, and returns a result
 *
 * _Available as `asyncAttempt` and `attempt.async`_
 *
 * @param callback Callback to execute
 * @returns Callback result
 */
export async function asyncAttempt<Value>(
	callback: () => Promise<Value>,
): Promise<Result<Awaited<Value>>>;

export async function asyncAttempt<Value, E>(
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
 *
 * @param callback Callback to execute
 * @param error Error value
 * @returns Callback result
 */
export function attempt<Value, E>(callback: () => Value, error: E): ExtendedResult<Value, E>;

/**
 * Executes a callback, catching any errors, and returns a result
 *
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

// #endregion
