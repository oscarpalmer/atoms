import type {Aborter} from '../internal/abort';
import {error, ok} from '../internal/result/misc';
import type {Result} from '../internal/result/models';
import type {PlainObject} from '../models';
import {
	PROMISE_MESSAGE_EXPECTATION_RESULT,
	PROMISE_TYPE_FULFILLED,
	PROMISE_TYPE_REJECTED,
} from './constants';
import {CancelablePromise, type PromiseParameters} from './models';

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

export function handleResult(status: string, parameters: PromiseParameters): void {
	const {aborter, complete, data, handlers, index, key, value} = parameters;

	if (aborter?.signal.aborted ?? false) {
		return;
	}

	if (!complete && status === PROMISE_TYPE_REJECTED) {
		settlePromise(handlers.reject, value, aborter);

		return;
	}

	(data.result as PlainObject)[key] = !complete
		? value
		: status === PROMISE_TYPE_FULFILLED
			? {status, value}
			: {status, reason: value};

	if (index === data.last) {
		settlePromise(handlers.resolve, data.result, aborter);
	}
}

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

export async function toResult<Value>(
	value: Promise<Value> | (() => Promise<Value>),
): Promise<Result<Value>> {
	const actual = typeof value === 'function' ? value() : value;

	if (!(actual instanceof Promise)) {
		return Promise.reject(new TypeError(PROMISE_MESSAGE_EXPECTATION_RESULT));
	}

	return actual.then(result => ok(result)).catch(reason => error(reason));
}

// #endregion

// #region Exports

export {toPromise as fromResult} from '../result/misc';
export {isFulfilled, isRejected} from './helpers';

// #endregion
