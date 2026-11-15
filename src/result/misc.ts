import {isOk, isResult} from '../internal/result/is';
import type {Result} from '../models/result.model';

// #region Functions

/**
 * Converts a result to a _Promise_
 *
 * Resolves if ok, rejects for error
 *
 * @param callback Callback to get the result
 * @returns Promised result
 */
export async function toPromise<Value, E = Error>(callback: () => Result<Value, E>): Promise<Value>;

/**
 * Converts a result to a _Promise_
 *
 * Resolves if ok, rejects for error
 *
 * @param result Result to convert
 * @returns Promised result
 */
export async function toPromise<Value, E = Error>(result: Result<Value, E>): Promise<Value>;

export function toPromise(result: unknown): Promise<unknown> {
	const actual = typeof result === 'function' ? result() : result;

	if (!isResult(actual)) {
		return Promise.reject(new TypeError(RESULT_MESSAGE_PROMISE));
	}

	if (isOk(actual)) {
		return Promise.resolve(actual.value);
	}

	return Promise.reject(actual.error);
}

// #endregion

// #region Variables

const RESULT_MESSAGE_PROMISE = 'toPromise expected to receive a Result';

// #endregion

// #region Exports

export {isError, isOk, isResult} from '../internal/result/is';
export {error, ok, unwrap} from '../internal/result/misc';

// #endregion
