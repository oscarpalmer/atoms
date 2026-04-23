import {isOk, isResult} from '../internal/result';
import type {AnyResult, ExtendedErr, ResultMatch} from './models';

// #region Functions

/**
 * Handles a result with match callbacks
 * @param result Result to handle
 * @param handler Match callbacks
 */
export async function asyncMatchResult<Value, Returned, E = Error>(
	result: AnyResult<Value, E> | Promise<AnyResult<Value, E>> | (() => Promise<AnyResult<Value, E>>),
	handler: ResultMatch<Value, Returned, E>,
): Promise<Returned>;

/**
 * Handles a result with match callbacks
 * @param result Result to handle
 * @param ok Ok callback
 * @param error Error callback
 */
export async function asyncMatchResult<Value, Returned, E = Error>(
	result: AnyResult<Value, E> | Promise<AnyResult<Value, E>> | (() => Promise<AnyResult<Value, E>>),
	ok: ResultMatch<Value, Returned, E>['ok'],
	error: ResultMatch<Value, Returned, E>['error'],
): Promise<Returned>;

export async function asyncMatchResult<Value, Returned, E = Error>(
	result: AnyResult<Value, E> | Promise<AnyResult<Value, E>> | (() => Promise<AnyResult<Value, E>>),
	first: ResultMatch<Value, Returned, E> | ResultMatch<Value, Returned, E>['ok'],
	error?: ResultMatch<Value, Returned, E>['error'],
): Promise<Returned> {
	let value: AnyResult<Value, E>;

	if (typeof result === 'function') {
		value = await result();
	} else if (result instanceof Promise) {
		value = await result;
	} else {
		value = result;
	}

	if (!isResult(value)) {
		throw new Error(MESSAGE_RESULT);
	}

	const hasObj = typeof first === 'object' && first !== null;

	const okHandler = hasObj ? first.ok : first;
	const errorHandler = hasObj ? first.error : error;

	if (isOk(value)) {
		return okHandler(value.value);
	}

	return errorHandler!(value.error, (value as ExtendedErr<E>).original);
}

/**
 * Handles a result with match callbacks
 *
 * Available as `matchResult` and `attempt.match`
 * @param result Result to handle
 * @param handler Match callbacks
 */
export function matchResult<Value, Returned, E = Error>(
	result: AnyResult<Value, E> | (() => AnyResult<Value, E>),
	handler: ResultMatch<Value, Returned, E>,
): Returned;

/**
 * Handles a result with match callbacks
 *
 * Available as `matchResult` and `attempt.match`
 * @param result Result to handle
 * @param ok Ok callback
 * @param error Error callback
 */
export function matchResult<Value, Returned, E = Error>(
	result: AnyResult<Value, E> | (() => AnyResult<Value, E>),
	ok: ResultMatch<Value, Returned, E>['ok'],
	error: ResultMatch<Value, Returned, E>['error'],
): Returned;

export function matchResult<Value, Returned, E = Error>(
	result: AnyResult<Value, E> | (() => AnyResult<Value, E>),
	first: ResultMatch<Value, Returned, E> | ResultMatch<Value, Returned, E>['ok'],
	error?: ResultMatch<Value, Returned, E>['error'],
): Returned {
	const value = typeof result === 'function' ? result() : result;

	if (!isResult(value)) {
		throw new Error(MESSAGE_RESULT);
	}

	const hasObj = typeof first === 'object' && first !== null;

	const okHandler = hasObj ? first.ok : first;
	const errorHandler = hasObj ? first.error : error;

	if (isOk(value)) {
		return okHandler(value.value);
	}

	return errorHandler!(value.error, (value as ExtendedErr<E>).original);
}

matchResult.async = asyncMatchResult;

// #endregion

// #region Variables

const MESSAGE_RESULT = '`result.match` expected a Result or a function that returns a Result';

// #endregion
