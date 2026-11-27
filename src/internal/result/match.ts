import type {GenericCallback} from '../../models/misc.model';
import {
	RESULT_MESSAGE_MATCH_ERROR,
	RESULT_MESSAGE_MATCH_OK,
	RESULT_MESSAGE_MATCH_RESULT,
	type Result,
	type ResultMatch,
} from '../../models/result.model';
import {isPlainObject, isThenable} from '../is';
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
export async function match<V, Next, Nope, E = Error>(
	result: Promise<Result<V, E>> | (() => Promise<Result<V, E>>),
	matchers: ResultMatch<V, E, Next, Nope>,
): Promise<Awaited<Next> | Awaited<Nope>>;

/**
 * Match the result with ok and error handlers, called based on the result type
 *
 * @param ok Callback for the ok result
 * @param error Callback for the error result
 * @returns Matched result value
 */
export async function match<V, Next, Nope, E = Error>(
	result: Promise<Result<V, E>> | (() => Promise<Result<V, E>>),
	ok: ResultMatch<V, E, Next, Nope>['ok'],
	error: ResultMatch<V, E, Next, Nope>['error'],
): Promise<Awaited<Next> | Awaited<Nope>>;

/**
 * Match the result with ok and error handlers, called based on the result type
 *
 * @param matchers Match callbacks
 * @returns Matched result
 */
export function match<V, Next, Nope, E = Error>(
	result: Result<V, E> | (() => Result<V, E>),
	matchers: ResultMatch<V, E, Next, Nope>,
): Next | Nope;

/**
 * Match the result with ok and error handlers, called based on the result type
 *
 * @param ok Callback for the ok result
 * @param error Callback for the error result
 * @returns Matched result
 */
export function match<V, Next, Nope, E = Error>(
	result: Result<V, E> | (() => Result<V, E>),
	ok: ResultMatch<V, E, Next, Nope>['ok'],
	error: ResultMatch<V, E, Next, Nope>['error'],
): Next | Nope;

export function match(result: unknown, first: unknown, second?: unknown): unknown {
	const value = typeof result === 'function' ? result() : result;

	if (isThenable(value)) {
		return Promise.resolve(value).then(resolved => {
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
