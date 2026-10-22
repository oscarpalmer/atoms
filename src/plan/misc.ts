import {getGenerator} from '../internal/plan';
import {error} from '../internal/result/misc';
import {
	PLAN_FAILURE_ASYNC,
	PLAN_FAILURE_SYNC,
	PLAN_SUCCESS_ASYNC,
	PLAN_SUCCESS_SYNC,
	PLAN_SYMBOL,
	type AsyncFailure,
	type AsyncSuccess,
	type Failure,
	type InternalAsyncFailure,
	type InternalAsyncSuccess,
	type InternalFailure,
	type InternalSuccess,
	type Success,
} from '../models/plan.model';

// #region Instances

function AsyncFailure(this: InternalAsyncFailure, generator: () => AsyncGenerator): void {
	this[PLAN_SYMBOL] = {
		generator,
		type: PLAN_FAILURE_ASYNC,
	};
}

AsyncFailure.prototype[Symbol.asyncIterator] = getGenerator;

function AsyncSuccess(this: InternalAsyncSuccess, generator: () => AsyncGenerator): void {
	this[PLAN_SYMBOL] = {
		generator,
		type: PLAN_SUCCESS_ASYNC,
	};
}

AsyncSuccess.prototype[Symbol.asyncIterator] = getGenerator;

function Failure(this: InternalFailure, generator: () => Generator): void {
	this[PLAN_SYMBOL] = {
		generator,
		type: PLAN_FAILURE_SYNC,
	};
}

Failure.prototype[Symbol.iterator] = getGenerator;

function Success(this: InternalSuccess, generator: () => Generator): void {
	this[PLAN_SYMBOL] = {
		generator,
		type: PLAN_SUCCESS_SYNC,
	};
}

Success.prototype[Symbol.iterator] = getGenerator;

// #endregion

// #region Functions

/**
 * Create an immediately failing plan
 *
 * @param callback Failure callback
 * @returns Plan failure
 */
export function asyncFail<Value>(callback: () => Value): AsyncFailure<Awaited<Value>>;

/**
 * Create an immediately failing plan
 *
 * @param value Failure value
 * @returns Plan failure
 */
export function asyncFail<Value>(value: Value): AsyncFailure<Awaited<Value>>;

export function asyncFail(value: unknown): AsyncFailure<unknown> {
	// @ts-expect-error All good, no worries :-)
	return new AsyncFailure(async function* () {
		yield error(await (typeof value === 'function' ? value() : value));
	});
}

/**
 * Create an immediately succeeding plan
 *
 * @param callback Success callback
 * @returns Plan success
 */
export function asyncSucceed<Value>(callback: () => Value): AsyncSuccess<Awaited<Value>>;

/**
 * Create an immediately succeeding plan
 *
 * @param value Success value
 * @returns Plan success
 */
export function asyncSucceed<Value>(value: Value): AsyncSuccess<Awaited<Value>>;

export function asyncSucceed(value: unknown): AsyncSuccess<unknown> {
	// @ts-expect-error All good, no worries :-)
	return new AsyncSuccess(async function* () {
		return typeof value === 'function' ? value() : value;
	});
}

/**
 * Create an immediately failing plan
 *
 * @param callback Failure callback
 * @returns Plan failure
 */
export function fail<Value>(callback: () => Value): Failure<Value>;

/**
 * Create an immediately failing plan
 *
 * @param value Failure value
 * @returns Plan failure
 */
export function fail<Value>(value: Value): Failure<Value>;

export function fail(value: unknown): Failure<unknown> {
	// @ts-expect-error All good, no worries :-)
	return new Failure(function* () {
		yield error(typeof value === 'function' ? value() : value);
	});
}

/**
 * Create an immediately succeeding plan
 *
 * @param callback Success callback
 * @returns Plan success
 */
export function succeed<Value>(callback: () => Value): Success<Value>;

/**
 * Create an immediately succeeding plan
 *
 * @param value Success value
 * @returns Plan success
 */
export function succeed<Value>(value: Value): Success<Value>;

export function succeed(value: unknown): Success<unknown> {
	// @ts-expect-error All good, no worries :-)
	return new Success(function* () {
		return typeof value === 'function' ? value() : value;
	});
}

// #endregion

// #region Namespaces

export declare namespace fail {
	export var async: typeof asyncFail;
}

export declare namespace succeed {
	export var async: typeof asyncSucceed;
}

// #endregion

// #region Initialization

fail.async = asyncFail;
succeed.async = asyncSucceed;

// #endregion
