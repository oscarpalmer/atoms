import {
	RESULT_MESSAGE_UNWRAP,
	RESULT_NAME_ERR,
	RESULT_NAME_OK,
	RESULT_SYMBOL,
	type Err,
	type Ok,
	type Result,
} from '../../models/result.model';
import {noop} from '../function/misc';
import {isPromise} from '../is';
import {isError, isOk, isResult} from './is';
import {match} from './match';

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

function andResult(this: Result<unknown, unknown>, next: unknown): unknown {
	if (!this.ok) {
		if (isPromise(next)) {
			void next.then(noop, noop);
		}

		return this;
	}

	if (typeof next === 'function') {
		next = next(this.value);
	}

	if (!isPromise(next)) {
		return wrap(next);
	}

	return next.then(wrap);
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

function mapResult(this: Result<unknown, unknown>, mapper: unknown): unknown {
	if (!this.ok) {
		if (isPromise(mapper)) {
			void mapper.then(noop, noop);
		}

		return this;
	}

	if (typeof mapper === 'function') {
		mapper = mapper(this.value);
	}

	if (!isPromise(mapper)) {
		return ok(mapper);
	}

	return mapper.then(ok);
}

function mapErrorResult(this: Result<unknown, unknown>, mapper: unknown): unknown {
	if (this.ok) {
		if (isPromise(mapper)) {
			void mapper.then(noop, noop);
		}

		return this;
	}

	if (typeof mapper === 'function') {
		mapper = mapper(this.error);
	}

	if (!isPromise(mapper)) {
		return error(mapper);
	}

	return mapper.then(error);
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
	if (this.ok) {
		if (isPromise(next)) {
			void next.then(noop, noop);
		}

		return this;
	}

	if (typeof next === 'function') {
		next = next(this.error);
	}

	if (!isPromise(next)) {
		return wrap(next);
	}

	return next.then(wrap);
}

/**
 * Gets the value of an ok result _(or a default value)_
 *
 * @param value Result to unwrap
 * @param defaultValue Default value
 * @returns Value of the result _(or the default value)_
 */
export function unwrap<V = unknown, E = Error, Next = V>(
	value: Result<V, E>,
	defaultValue: Next,
): V | Next {
	return isOk(value) ? value.value : defaultValue;
}

function unwrapResult(this: Result<unknown, unknown>, ...args: unknown[]): unknown {
	if (this.ok) {
		return this.value;
	}

	if (args.length === 0) {
		throw this.error instanceof Error
			? this.error
			: new Error(RESULT_MESSAGE_UNWRAP, {cause: this.error});
	}

	const [unwrapped] = args;

	return typeof unwrapped === 'function' ? unwrapped(this.error) : unwrapped;
}

function wrap(value: unknown): Result<unknown, unknown> {
	if (isResult(value)) {
		return value;
	}

	return ok(value);
}

// #endregion

// #region Namespace

export declare namespace error {
	export var is: typeof isError;
}

export declare namespace ok {
	export var is: typeof isOk;
}

// #endregion

// #region Initialization

error.is = isError;
ok.is = isOk;

// #endregion
