import {error, ok} from '../result/misc';
import type {Result} from '../result/models';
import {
	CancelablePromise,
	PROMISE_ABORT_EVENT,
	PROMISE_MESSAGE_EXPECTATION_RESULT,
	PROMISE_TYPE_FULFILLED,
	PROMISE_TYPE_REJECTED,
	type PromiseParameters,
} from './models';

// #region Functions

/**
 * Create a cancelable promise
 * @param executor Executor function for the promise
 * @returns Cancelable promise
 */
export function cancelable<Value>(
	executor: (resolve: (value: Value) => void, reject: (reason: unknown) => void) => void,
): CancelablePromise<Value> {
	return new CancelablePromise(executor);
}

export function handleResult(status: string, parameters: PromiseParameters): void {
	const {abort, complete, data, handlers, index, signal, value} = parameters;

	if (signal?.aborted ?? false) {
		return;
	}

	if (!complete && status === PROMISE_TYPE_REJECTED) {
		settlePromise(abort, handlers.reject, value, signal);

		return;
	}

	(data.result as unknown[])[index] = !complete
		? value
		: status === PROMISE_TYPE_FULFILLED
			? {status, value}
			: {status, reason: value};

	if (index === data.last) {
		settlePromise(abort, handlers.resolve, data.result, signal);
	}
}

export function settlePromise(
	aborter: () => void,
	settler: (value: any) => void,
	value: unknown,
	signal?: AbortSignal,
): void {
	signal?.removeEventListener(PROMISE_ABORT_EVENT, aborter);

	settler(value);
}

/**
 * Converts a promise to a promised result
 * @param callback Promise callback
 * @returns Promised result
 */
export async function toResult<Value>(callback: () => Promise<Value>): Promise<Result<Value>>;

/**
 * Converts a promise to a promised result
 * @param promise Promise to convert
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
