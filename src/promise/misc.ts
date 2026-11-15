import {isPromise} from '../internal/is';
import {error, ok} from '../internal/result/misc';
import type {Aborter} from '../models/aborter.model';
import {
	CancelablePromise,
	PROMISE_MESSAGE_EXPECTATION_RESULT,
	PROMISE_TYPE_FULFILLED,
	PROMISE_TYPE_REJECTED,
	type PromiseParameters,
} from '../models/promise.model';
import type {Result} from '../models/result.model';

// #region Functions

/**
 * Create a cancelable _Promise_
 *
 * @param executor Executor function for the _Promise_
 * @returns Cancelable _Promise_
 */
export function cancelable<Value>(
	executor: (resolve: (value: Value) => void, reject: (reason: unknown) => void) => void,
): CancelablePromise<Value> {
	return new CancelablePromise(executor);
}

/**
 * @internal
 */
export function handleResult(status: string, parameters: PromiseParameters): void {
	const {aborter, complete, data, handlers, key, value} = parameters;

	if (aborter?.signal.aborted ?? false) {
		return;
	}

	if (!complete && status === PROMISE_TYPE_REJECTED) {
		aborter?.cancel();

		handlers.reject(value);

		return;
	}

	let resultValue: unknown;

	if (complete) {
		resultValue = status === PROMISE_TYPE_FULFILLED ? {status, value} : {status, reason: value};
	} else {
		resultValue = value;
	}

	data.result[key as never] = resultValue;

	data.settled += 1;

	if (data.settled === data.total) {
		aborter?.cancel();

		handlers.resolve(data.result as unknown[]);
	}
}

/**
 * @internal
 */
export function settlePromise(
	settler: (value: any) => void,
	value: unknown,
	aborter?: Aborter,
): void {
	aborter?.cancel();

	settler(value);
}

/**
 * Converts a _Promise_ to a promised result
 *
 * @param callback _Promise_ callback
 * @returns Promised result
 */
export async function toResult<Value>(callback: () => Promise<Value>): Promise<Result<Value>>;

/**
 * Converts a _Promise_ to a promised result
 *
 * @param promise _Promise_ to convert
 * @returns Promised result
 */
export async function toResult<Value>(promise: Promise<Value>): Promise<Result<Value>>;

export async function toResult(
	value: Promise<unknown> | (() => Promise<unknown>),
): Promise<Result<unknown>> {
	let actual: unknown;

	try {
		actual = typeof value === 'function' ? value() : value;
	} catch (reason) {
		return error(reason) as never;
	}

	if (!isPromise(actual)) {
		throw new TypeError(PROMISE_MESSAGE_EXPECTATION_RESULT);
	}

	return actual.then(
		result => ok(result),
		reason => error(reason),
	);
}

// #endregion

// #region Exports

export {toPromise as fromResult} from '../result/misc';
export {isFulfilled, isRejected} from './helpers';

// #endregion
