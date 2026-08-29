import {isOk, isResult} from '../internal/result/misc';
import type {AnyResult} from '../internal/result/models';

// #region Functions

/**
 * Converts a result to a _Promise_
 *
 * Resolves if ok, rejects for error
 *
 * @param callback Callback to get the result
 * @returns Promised result
 */
export async function toPromise<Value, E = Error>(
	callback: () => AnyResult<Value, E>,
): Promise<Value>;

/**
 * Converts a result to a _Promise_
 *
 * Resolves if ok, rejects for error
 *
 * @param result _Result_ to convert
 * @returns Promised result
 */
export async function toPromise<Value, E = Error>(result: AnyResult<Value, E>): Promise<Value>;

/**
 * Converts a _Result_ to a _Promise_
 *
 * Resolves if ok, rejects for error
 *
 * @param result _Result_ to convert
 * @returns Promised result
 */
export async function toPromise<Value, E = Error>(
	result: AnyResult<Value, E> | (() => AnyResult<Value, E>),
): Promise<Value> {
	const actual = typeof result === 'function' ? result() : result;

	if (!isResult(actual)) {
		return Promise.reject(new Error(RESULT_MESSAGE_PROMISE));
	}

	return isOk(actual) ? Promise.resolve(actual.value) : Promise.reject(actual.error);
}

// #endregion

// #region Variables

const RESULT_MESSAGE_PROMISE = 'toPromise expected to receive a Result';

// #endregion

// #region Exports

export {error, isError, isOk, isResult, ok, unwrap} from '../internal/result/misc';

// #endregion
