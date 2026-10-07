import {isPlainObject} from '../internal/is';
import {isOk, isResult} from '../internal/result/misc';
import type {GenericCallback} from '../models/index';
import type {AnyResult, ExtendedErr, Result, ResultMatch} from '../models/result.model';

// #region Functions

/**
 * Handles a _Result_ with match callbacks
 *
 * _Available as `asyncMatchResult` and `matchResult.async`_
 *
 * @param result _Result_ to handle
 * @param handler Match callbacks
 * @returns Matched value-_Promise_
 */
export async function asyncMatchResult<Value, Returned, E = Error>(
	result: AnyResult<Value, E> | Promise<AnyResult<Value, E>> | (() => Promise<AnyResult<Value, E>>),
	handler: ResultMatch<Value, Returned, E>,
): Promise<Returned>;

/**
 * Handles a _Result_ with match callbacks
 *
 * _Available as `asyncMatchResult` and `matchResult.async`_
 *
 * @param result _Result_ to handle
 * @param ok Ok callback
 * @param error Error callback
 * @returns Matched value-_Promise_
 */
export async function asyncMatchResult<Value, Returned, E = Error>(
	result: AnyResult<Value, E> | Promise<AnyResult<Value, E>> | (() => Promise<AnyResult<Value, E>>),
	ok: ResultMatch<Value, Returned, E>['ok'],
	error: ResultMatch<Value, Returned, E>['error'],
): Promise<Returned>;

export async function asyncMatchResult(
	result: unknown,
	first: unknown,
	second?: unknown,
): Promise<unknown> {
	let value: unknown;

	if (typeof result === 'function') {
		value = await result();
	} else if (result instanceof Promise) {
		value = await result;
	} else {
		value = result;
	}

	if (!isResult(value)) {
		throw new Error(MATCH_MESSAGE_RESULT);
	}

	return handleResult(value, first, second);
}

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
			throw new Error(MATCH_MESSAGE_OK);
		}

		return ok(result.value);
	}

	if (typeof error !== 'function') {
		throw new Error(MATCH_MESSAGE_ERROR);
	}

	return error(result.error, (result as ExtendedErr<unknown>).original);
}

/**
 * Handles a _Result_ with match callbacks
 *
 * @param result _Result_ to handle
 * @param handler Match callbacks
 * @returns Matched value
 */
export function matchResult<Value, Returned, E = Error>(
	result: AnyResult<Value, E> | (() => AnyResult<Value, E>),
	handler: ResultMatch<Value, Returned, E>,
): Returned;

/**
 * Handles a _Result_ with match callbacks
 *
 * @param result _Result_ to handle
 * @param ok Ok callback
 * @param error Error callback
 * @returns Matched value
 */
export function matchResult<Value, Returned, E = Error>(
	result: AnyResult<Value, E> | (() => AnyResult<Value, E>),
	ok: ResultMatch<Value, Returned, E>['ok'],
	error: ResultMatch<Value, Returned, E>['error'],
): Returned;

export function matchResult(result: unknown, first: unknown, second?: unknown): unknown {
	const value = typeof result === 'function' ? result() : result;

	if (!isResult(value)) {
		throw new Error(MATCH_MESSAGE_RESULT);
	}

	return handleResult(value, first, second);
}

// #endregion

// #region Variables

const MATCH_MESSAGE_ERROR = '`result.match` expected an Error callback';

const MATCH_MESSAGE_OK = '`result.match` expected an Ok callback';

const MATCH_MESSAGE_RESULT = '`result.match` expected a Result or a function that returns a Result';

// #endregion

// #region Namespace

export declare namespace matchResult {
	export var async: typeof asyncMatchResult;
}

// #endregion

// #region Initialization

matchResult.async = asyncMatchResult;

// #endregion
