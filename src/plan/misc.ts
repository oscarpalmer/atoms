import {isAsyncFunction, isThenable} from '../internal/is';
import {getGenerator} from '../internal/plan';
import {swallow} from '../internal/promise';
import {error} from '../internal/result/value';
import {
	PLAN_FAILURE_ASYNC,
	PLAN_FAILURE_SYNC,
	PLAN_MESSAGE_FAIL_PROMISE,
	PLAN_MESSAGE_SUCCEED_PROMISE,
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
export function fail<Value>(callback: () => Promise<Value>): AsyncFailure<Awaited<Value>>;

/**
 * Create an immediately failing plan
 *
 * @param value Failure value
 * @returns Plan failure
 */
export function fail<Value>(value: Promise<Value>): AsyncFailure<Awaited<Value>>;

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

export function fail(value: unknown): unknown {
	if (isAsyncFunction(value) || isThenable(value)) {
		// @ts-expect-error Using old school function constructor, so all good, no worries :-)
		return new AsyncFailure(async function* () {
			yield error(await (typeof value === 'function' ? value() : value));
		});
	}

	// @ts-expect-error Using old school function constructor, so all good, no worries :-)
	return new Failure(function* () {
		value = typeof value === 'function' ? value() : value;

		if (isThenable(value)) {
			swallow(value);

			throw new Error(PLAN_MESSAGE_FAIL_PROMISE);
		}

		yield error(value);
	});
}

/**
 * Create an immediately succeeding plan
 *
 * @param callback Success callback
 * @returns Plan success
 */
export function succeed<Value>(callback: () => Promise<Value>): AsyncSuccess<Awaited<Value>>;

/**
 * Create an immediately succeeding plan
 *
 * @param value Success value
 * @returns Plan success
 */
export function succeed<Value>(value: Promise<Value>): AsyncSuccess<Awaited<Value>>;

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

export function succeed(value: unknown): unknown {
	if (isAsyncFunction(value) || isThenable(value)) {
		// @ts-expect-error Using old school function constructor, so all good, no worries :-)
		return new AsyncSuccess(async function* () {
			return typeof value === 'function' ? value() : value;
		});
	}

	// @ts-expect-error Using old school function constructor, so all good, no worries :-)
	return new Success(function* () {
		value = typeof value === 'function' ? value() : value;

		if (isThenable(value)) {
			swallow(value);

			throw new Error(PLAN_MESSAGE_SUCCEED_PROMISE);
		}

		return value;
	});
}

// #endregion
