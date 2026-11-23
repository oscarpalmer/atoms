import {
	type Err,
	type Ok,
	type Result,
	RESULT_NAME_ERR,
	RESULT_NAME_OK,
	RESULT_SYMBOL,
} from '../../models/result.model';
import {isThenable} from '../is';
import {swallow} from '../promise';
import {
	isError,
	isErrorLike,
	isErrorLikeValue,
	isOk,
	isOkLike,
	isOkLikeValue,
	isResult,
} from './is';
import {match} from './match';
import {unwrapValue} from './misc';

// #region Instances

function Err(this: any, error: unknown): void {
	this[RESULT_SYMBOL] = RESULT_NAME_ERR;

	this.error = error;
	this.ok = false;
}

Err.prototype[Symbol.asyncIterator] = iterateResultAsync;
Err.prototype[Symbol.iterator] = iterateResult;

Err.prototype.and = andResult;
Err.prototype.clone = cloneResult;
Err.prototype.isError = isErrorResult;
Err.prototype.isOk = isOkResult;
Err.prototype.map = mapResult;
Err.prototype.mapError = mapErrorResult;
Err.prototype.match = matchResult;
Err.prototype.or = orResult;
Err.prototype.unwrap = unwrapResult;

function Ok(this: any, value: unknown): void {
	this[RESULT_SYMBOL] = RESULT_NAME_OK;

	this.value = value;
	this.ok = true;
}

Ok.prototype[Symbol.asyncIterator] = iterateResultAsync;
Ok.prototype[Symbol.iterator] = iterateResult;

Ok.prototype.and = andResult;
Ok.prototype.clone = cloneResult;
Ok.prototype.isError = isErrorResult;
Ok.prototype.isOk = isOkResult;
Ok.prototype.map = mapResult;
Ok.prototype.mapError = mapErrorResult;
Ok.prototype.match = matchResult;
Ok.prototype.or = orResult;
Ok.prototype.unwrap = unwrapResult;

// #endregion

// #region Functions

function andResult(this: Result<unknown, unknown>, next: unknown): unknown {
	return handleResult(this, next, false, this[RESULT_SYMBOL] === RESULT_NAME_ERR);
}

function cloneResult(this: Result<unknown, unknown>): Result<unknown, unknown> {
	return this[RESULT_SYMBOL] === RESULT_NAME_OK ? ok(this.value) : error(this.error);
}

/**
 * Creates an error result
 *
 * @param value Error value
 * @returns Error result
 */
export function error<V = never, E = Error>(value: E): Err<V, E> {
	// @ts-expect-error Using old school function constructor, so all good, no worries :-)
	return new Err(value);
}

function handleResult(
	result: Result<unknown, unknown>,
	next: unknown,
	map: boolean,
	ignore: boolean,
): unknown {
	if (ignore) {
		if (isThenable(next)) {
			swallow(next);
		}

		return result;
	}

	let value = next;

	if (typeof next === 'function') {
		value = next(result[RESULT_SYMBOL] === RESULT_NAME_OK ? result.value : result.error);
	}

	let wrapper: (value: unknown) => Result<unknown, unknown>;

	if (map) {
		wrapper = result[RESULT_SYMBOL] === RESULT_NAME_OK ? ok : error;
	} else {
		wrapper = ok;
	}

	if (isThenable(value)) {
		return Promise.resolve(value).then(v => (map ? wrapper(v) : wrapResult(v, wrapper)));
	}

	return map ? wrapper(value) : wrapResult(value, wrapper);
}

function isErrorResult(
	this: Err<unknown, unknown>,
	predicate?: (value: unknown) => boolean,
): boolean {
	return isError(this) && (typeof predicate === 'function' ? predicate(this.error) : true);
}

function isOkResult(this: Ok<unknown, unknown>, predicate?: (value: unknown) => boolean): boolean {
	return isOk(this) && (typeof predicate === 'function' ? predicate(this.value) : true);
}

function* iterateResult(this: Result<unknown, unknown>): unknown {
	if (this[RESULT_SYMBOL] === RESULT_NAME_OK) {
		return this.value;
	}

	yield this;
}

async function* iterateResultAsync(this: Result<unknown, unknown>): unknown {
	if (this[RESULT_SYMBOL] === RESULT_NAME_OK) {
		return await this.value;
	}

	yield this;
}

function mapErrorResult(this: Result<unknown, unknown>, next: unknown): unknown {
	return handleResult(this, next, true, this[RESULT_SYMBOL] === RESULT_NAME_OK);
}

function mapResult(this: Result<unknown, unknown>, next: unknown): unknown {
	return handleResult(this, next, true, this[RESULT_SYMBOL] === RESULT_NAME_ERR);
}

function matchResult(this: Result<unknown, unknown>, first: unknown, second: unknown): unknown {
	return match(this, first as never, second as never);
}

/**
 * Creates an ok result
 *
 * @param value Value
 * @returns Ok result
 */
export function ok<V, E = never>(value: V): Ok<V, E> {
	// @ts-expect-error Using old school function constructor, so all good, no worries :-)
	return new Ok(value) as Ok<V, E>;
}

function orResult(this: Result<unknown, unknown>, next: unknown): unknown {
	return handleResult(this, next, false, this[RESULT_SYMBOL] === RESULT_NAME_OK);
}

/**
 * Parse a value as an error result
 *
 * @param value Value to parse
 * @returns Error result if the value is parseable, otherwise `undefined`
 */
export function parseError<E = unknown>(value: unknown): Err<never, E> | undefined {
	return parseResultValue(value, true, false) as Err<never, E> | undefined;
}

/**
 * Parse a value as an ok result
 *
 * @param value Value to parse
 * @returns Ok result if the value is parseable, otherwise `undefined`
 */
export function parseOk<V>(value: unknown): Ok<V, never> | undefined {
	return parseResultValue(value, false, true) as Ok<V, never> | undefined;
}

/**
 * Parse a value as a result
 *
 * @param value Value to parse
 * @returns Result if the value is parseable, otherwise `undefined`
 */
export function parseResult<V = unknown, E = unknown>(value: unknown): Result<V, E> | undefined {
	return parseResultValue(value, true, true) as Result<V, E> | undefined;
}

function parseResultValue(
	value: unknown,
	allowError: boolean,
	allowOk: boolean,
): Result<unknown, unknown> | undefined {
	if (typeof value !== 'object' || value === null) {
		return undefined;
	}

	if (RESULT_SYMBOL in value) {
		const valueAsResult = value as Result<unknown, unknown>;

		if (
			(allowError && valueAsResult[RESULT_SYMBOL] === RESULT_NAME_ERR) ||
			(allowOk && valueAsResult[RESULT_SYMBOL] === RESULT_NAME_OK)
		) {
			return valueAsResult;
		}

		return undefined;
	}

	if (allowError && isErrorLikeValue(value)) {
		return error(value.error);
	}

	return allowOk && isOkLikeValue(value) ? ok(value.value) : undefined;
}

function unwrapResult(this: Result<unknown, unknown>, ...args: unknown[]): unknown {
	return unwrapValue(
		this,
		this[RESULT_SYMBOL] === RESULT_NAME_OK,
		this[RESULT_SYMBOL] === RESULT_NAME_ERR,
		...args,
	);
}

function wrapResult(
	value: unknown,
	wrapper: (value: unknown) => Result<unknown, unknown>,
): Result<unknown, unknown> {
	return isResult(value) ? value : wrapper(value);
}

// #region Namespace

export declare namespace error {
	export var is: typeof isError;
	export var like: typeof isErrorLike;
	export var parse: typeof parseError;
}

export declare namespace ok {
	export var is: typeof isOk;
	export var like: typeof isOkLike;
	export var parse: typeof parseOk;
}

// #endregion

// #region Initialization

error.is = isError;
error.like = isErrorLike;
error.parse = parseError;

ok.is = isOk;
ok.like = isOkLike;
ok.parse = parseOk;

// #endregion
