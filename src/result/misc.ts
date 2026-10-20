import {isOk, isResult} from '../internal/result/misc';
import type {AnyResult} from '../models/result.model';

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

export async function toPromise(result: unknown): Promise<unknown> {
	const actual = typeof result === 'function' ? result() : result;

	if (!isResult(actual)) {
		throw new TypeError(RESULT_MESSAGE_PROMISE);
	}

	if (isOk(actual)) {
		return actual.value;
	}

	throw actual.error;
}

// #endregion

// #region Variables

const RESULT_MESSAGE_PROMISE = 'toPromise expected to receive a Result';

// #endregion

// #region Exports

export {error, isError, isOk, isResult, ok, unwrap} from '../internal/result/misc';

// #endregion
