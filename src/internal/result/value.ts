import {
	type Err,
	type Ok,
	type Result,
	RESULT_NAME_ERR,
	RESULT_NAME_OK,
	RESULT_SYMBOL,
} from '../../models/result.model';
import {noop} from '../function/misc';
import {isPromise} from '../is';
import {isError, isOk, isResult} from './is';
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
Ok.prototype.isError = isErrorResult;
Ok.prototype.isOk = isOkResult;
Ok.prototype.map = mapResult;
Ok.prototype.mapError = mapErrorResult;
Ok.prototype.match = matchResult;
Ok.prototype.or = orResult;
Ok.prototype.unwrap = unwrapResult;

// #endregion

// #region Functions

// #endregion

// #region Namespace

export declare namespace error {
	export var is: typeof isError;
}

export declare namespace ok {
	export var is: typeof isOk;
}

// #endregion

function andResult(this: Result<unknown, unknown>, next: unknown): unknown {
	return handleResult(this, next, false, !this.ok);
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
		if (isPromise(next)) {
			void next.then(noop, noop);
		}

		return result;
	}

	let value = next;

	if (typeof next === 'function') {
		value = next(result.ok ? result.value : result.error);
	}

	let wrapper: (value: unknown) => Result<unknown, unknown>;

	if (map) {
		wrapper = result.ok ? ok : error;
	} else {
		wrapper = ok;
	}

	if (isPromise(value)) {
		return value.then(v => (map ? wrapper(v) : wrapResult(v, wrapper)));
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
	if (this.ok) {
		return this.value;
	}

	yield this;
}

async function* iterateResultAsync(this: Result<unknown, unknown>): unknown {
	if (this.ok) {
		return await this.value;
	}

	yield this;
}

function mapErrorResult(this: Result<unknown, unknown>, next: unknown): unknown {
	return handleResult(this, next, true, this.ok);
}

function mapResult(this: Result<unknown, unknown>, next: unknown): unknown {
	return handleResult(this, next, true, !this.ok);
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
	return handleResult(this, next, false, this.ok);
}

function unwrapResult(this: Result<unknown, unknown>, ...args: unknown[]): unknown {
	return unwrapValue(this, this.ok, !this.ok, ...args);
}

function wrapResult(
	value: unknown,
	wrapper: (value: unknown) => Result<unknown, unknown>,
): Result<unknown, unknown> {
	return isResult(value) ? value : wrapper(value);
}

// #region Initialization

error.is = isError;
ok.is = isOk;

// #endregion
