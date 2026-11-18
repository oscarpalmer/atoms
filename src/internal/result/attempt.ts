import type {Result} from '../../models/result.model';
import {RESULT_MESSAGE_ATTEMPT} from '../../models/result.model';
import {isPromise} from '../is';
import {error, ok} from './value';

// #region Functions

/**
 * Executes a promise, catching any errors, and returns a result
 *
 * @param promise Promise to execute
 * @returns Callback result
 */
export async function attempt<V, E = Error>(promise: Promise<V>): Promise<Result<V, E>>;

/**
 * Executes a callback, catching any errors, and returns a result
 *
 * @param callback Callback to execute
 * @returns Callback result
 */
export function attempt<V, E = Error>(
	callback: () => V,
): V extends Promise<infer U> ? Promise<Result<U, E>> : Result<V, E>;

export function attempt(input: unknown): unknown {
	const inputIsPromise = isPromise(input);

	if (!inputIsPromise && typeof input !== 'function') {
		throw new TypeError(RESULT_MESSAGE_ATTEMPT);
	}

	try {
		const value = inputIsPromise ? input : input();

		if (isPromise(value)) {
			return new Promise(resolve => {
				void value.then(
					v => resolve(ok(v)),
					e => resolve(error(e)),
				);
			});
		}

		return ok(value);
	} catch (error_: unknown) {
		return error(error_ as never);
	}
}

// #endregion
