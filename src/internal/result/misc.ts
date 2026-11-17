import {
	RESULT_MESSAGE_PROMISE,
	RESULT_MESSAGE_UNWRAP,
	type Err,
	type Ok,
	type Result,
} from '../../models/result.model';
import {isError, isOk, isResult} from './is';

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

/**
 * Gets the value of an ok result _(or a fallback value from an error handler)_
 *
 * @param value Result to unwrap
 * @param next Error handler to get the fallback value
 * @returns Value of the ok result _(or the fallback value)_
 */
export function unwrap<V = unknown, E = Error, Next = V>(
	value: Result<V, E>,
	next: (error: E) => Next,
): V | Next;

/**
 * Gets the value of an ok result _(or a fallback value)_
 *
 * @param value Result to unwrap
 * @param next Fallback value
 * @returns Value of the ok result _(or the fallback value)_
 */
export function unwrap<V = unknown, E = Error, Next = V>(value: Result<V, E>, next: Next): V | Next;

/**
 * Gets the value of an ok result
 *
 * _Throws if the result is an error_
 *
 * @param value Result to unwrap
 * @returns Value of the ok result
 */
export function unwrap<V = unknown, E = Error>(value: Result<V, E>): V;

export function unwrap(value: unknown, ...args: unknown[]): unknown {
	return unwrapValue(value, undefined, undefined, ...args);
}

export function unwrapValue(
	value: unknown,
	ok: boolean | undefined,
	error: boolean | undefined,
	...args: unknown[]
): unknown {
	if (ok ?? isOk(value)) {
		return (value as Ok<unknown, unknown>).value;
	}

	const valueAsError = value as Err<unknown, unknown>;

	error ??= isError(value);

	if (args.length === 0) {
		if (error && valueAsError.error instanceof Error) {
			throw valueAsError.error;
		}

		throw new Error(RESULT_MESSAGE_UNWRAP, error ? {cause: valueAsError.error} : undefined);
	}

	const [unwrapped] = args;

	if (typeof unwrapped === 'function') {
		return unwrapped(error ? valueAsError.error : undefined);
	}

	return unwrapped;
}

// #endregion
