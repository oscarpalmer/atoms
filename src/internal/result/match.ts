import type {GenericCallback} from '../../models/index';
import {
	RESULT_MESSAGE_MATCH_ERROR,
	RESULT_MESSAGE_MATCH_OK,
	RESULT_MESSAGE_MATCH_RESULT,
	type Result,
	type ResultMatch,
} from '../../models/result.model';
import {isPlainObject, isPromise} from '../is';
import {isOk, isResult} from '../result/is';

// #region Functions

function handleResult(result: Result<unknown, unknown>, first: unknown, second?: unknown): unknown {
	let error: GenericCallback;
	let ok: GenericCallback;

	if (isPlainObject(first)) {
		ok = first.ok as GenericCallback;
		error = first.error as GenericCallback;
	} else {
		ok = first as GenericCallback;
		error = second as GenericCallback;
	}

	if (isOk(result)) {
		if (typeof ok !== 'function') {
			throw new TypeError(RESULT_MESSAGE_MATCH_OK);
		}

		return ok(result.value);
	}

	if (typeof error !== 'function') {
		throw new TypeError(RESULT_MESSAGE_MATCH_ERROR);
	}

	return error(result.error);
}

/**
 * Match the result with ok and error handlers, called based on the result type
 *
 * @param matchers Match callbacks
 * @returns Matched result
 */
export function match<Value, Returned, E = Error>(
	result: Promise<Result<Value, E>> | (() => Promise<Result<Value, E>>),
	handler: ResultMatch<Value, E, Returned, Returned>,
): Promise<Awaited<Returned>>;

/**
 * Match the result with ok and error handlers, called based on the result type
 *
 * @param ok Callback for the ok result
 * @param error Callback for the error result
 * @returns Matched result value
 */
export function match<Value, Returned, E = Error>(
	result: Promise<Result<Value, E>> | (() => Promise<Result<Value, E>>),
	ok: ResultMatch<Value, E, Returned, Returned>['ok'],
	error: ResultMatch<Value, E, Returned, Returned>['error'],
): Promise<Awaited<Returned>>;

/**
 * Match the result with ok and error handlers, called based on the result type
 *
 * @param matchers Match callbacks
 * @returns Matched result
 */
export function match<Value, Returned, E = Error>(
	result: Result<Value, E> | (() => Result<Value, E>),
	handler: ResultMatch<Value, E, Returned, Returned>,
): Returned;

/**
 * Match the result with ok and error handlers, called based on the result type
 *
 * @param ok Callback for the ok result
 * @param error Callback for the error result
 * @returns Matched result
 */
export function match<Value, Returned, E = Error>(
	result: Result<Value, E> | (() => Result<Value, E>),
	ok: ResultMatch<Value, E, Returned, Returned>['ok'],
	error: ResultMatch<Value, E, Returned, Returned>['error'],
): Returned;

export function match(result: unknown, first: unknown, second?: unknown): unknown {
	const value = typeof result === 'function' ? result() : result;

	if (isPromise(value)) {
		return value.then(resolved => {
			if (!isResult(resolved)) {
				throw new Error(RESULT_MESSAGE_MATCH_RESULT);
			}

			return handleResult(resolved, first, second);
		});
	}

	if (!isResult(value)) {
		throw new Error(RESULT_MESSAGE_MATCH_RESULT);
	}

	return handleResult(value, first, second);
}

// #endregion
