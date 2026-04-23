import {flow} from '../../function/work';
import {isError, isOk} from '../../internal/result';
import type {GenericCallback} from '../../models';
import {attempt} from '../index';
import type {Result, UnwrapValue} from '../models';

// #region Types

/**
 * A synchronous Flow, a function that attempts to pipe values through a series of functions
 */
export type AttemptFlow<Callback extends GenericCallback, Value> = (
	...args: Parameters<Callback>
) => Result<UnwrapValue<Value>>;

/**
 * An asynchronous Flow, a function that attempts to pipe values through a series of functions
 */
export type AttemptFlowPromise<Callback extends GenericCallback, Value> = (
	...args: Parameters<Callback>
) => Promise<Result<UnwrapValue<Value>>>;

// #endregion

// #region Functions

// #region Asynchronous

/**
 * Create an asynchronous Flow, a function that attempts to pipe a value through a series of functions
 *
 * Available as `attemptAsyncFlow` and `attempt.flow.async`
 * @returns Flow function
 */
export function attemptAsyncFlow<Fn extends GenericCallback>(
	fn: Fn,
): AttemptFlowPromise<Fn, ReturnType<Fn>>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 *
 * Available as `attemptAsyncFlow` and `attempt.flow.async`
 * @returns Flow function
 */
export function attemptAsyncFlow<First extends GenericCallback, Second>(
	first: First,
	second: (value: Awaited<UnwrapValue<ReturnType<First>>>) => Second,
): AttemptFlowPromise<First, Second>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 *
 * Available as `attemptAsyncFlow` and `attempt.flow.async`
 * @returns Flow function
 */
export function attemptAsyncFlow<First extends GenericCallback, Second, Third>(
	first: First,
	second: (value: Awaited<UnwrapValue<ReturnType<First>>>) => Second,
	third: (value: Awaited<UnwrapValue<Second>>) => Third,
): AttemptFlowPromise<First, Third>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 *
 * Available as `attemptAsyncFlow` and `attempt.flow.async`
 * @returns Flow function
 */
export function attemptAsyncFlow<First extends GenericCallback, Second, Third, Fourth>(
	first: First,
	second: (value: Awaited<UnwrapValue<ReturnType<First>>>) => Second,
	third: (value: Awaited<UnwrapValue<Second>>) => Third,
	fourth: (value: Awaited<UnwrapValue<Third>>) => Fourth,
): AttemptFlowPromise<First, Fourth>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 *
 * Available as `attemptAsyncFlow` and `attempt.flow.async`
 * @returns Flow function
 */
export function attemptAsyncFlow<First extends GenericCallback, Second, Third, Fourth, Fifth>(
	first: First,
	second: (value: Awaited<UnwrapValue<ReturnType<First>>>) => Second,
	third: (value: Awaited<UnwrapValue<Second>>) => Third,
	fourth: (value: Awaited<UnwrapValue<Third>>) => Fourth,
	fifth: (value: Awaited<UnwrapValue<Fourth>>) => Fifth,
): AttemptFlowPromise<First, Fifth>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 *
 * Available as `attemptAsyncFlow` and `attempt.flow.async`
 * @returns Flow function
 */
export function attemptAsyncFlow<
	First extends GenericCallback,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
>(
	first: First,
	second: (value: Awaited<UnwrapValue<ReturnType<First>>>) => Second,
	third: (value: Awaited<UnwrapValue<Second>>) => Third,
	fourth: (value: Awaited<UnwrapValue<Third>>) => Fourth,
	fifth: (value: Awaited<UnwrapValue<Fourth>>) => Fifth,
	sixth: (value: Awaited<UnwrapValue<Fifth>>) => Sixth,
): AttemptFlowPromise<First, Sixth>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 *
 * Available as `attemptAsyncFlow` and `attempt.flow.async`
 * @returns Flow function
 */
export function attemptAsyncFlow<
	First extends GenericCallback,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
>(
	first: First,
	second: (value: Awaited<UnwrapValue<ReturnType<First>>>) => Second,
	third: (value: Awaited<UnwrapValue<Second>>) => Third,
	fourth: (value: Awaited<UnwrapValue<Third>>) => Fourth,
	fifth: (value: Awaited<UnwrapValue<Fourth>>) => Fifth,
	sixth: (value: Awaited<UnwrapValue<Fifth>>) => Sixth,
	seventh: (value: Awaited<UnwrapValue<Sixth>>) => Seventh,
): AttemptFlowPromise<First, Seventh>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 *
 * Available as `attemptAsyncFlow` and `attempt.flow.async`
 * @returns Flow function
 */
export function attemptAsyncFlow<
	First extends GenericCallback,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
	Eighth,
>(
	first: First,
	second: (value: Awaited<UnwrapValue<ReturnType<First>>>) => Second,
	third: (value: Awaited<UnwrapValue<Second>>) => Third,
	fourth: (value: Awaited<UnwrapValue<Third>>) => Fourth,
	fifth: (value: Awaited<UnwrapValue<Fourth>>) => Fifth,
	sixth: (value: Awaited<UnwrapValue<Fifth>>) => Sixth,
	seventh: (value: Awaited<UnwrapValue<Sixth>>) => Seventh,
	eighth: (value: Awaited<UnwrapValue<Seventh>>) => Eighth,
): AttemptFlowPromise<First, Eighth>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 *
 * Available as `attemptAsyncFlow` and `attempt.flow.async`
 * @returns Flow function
 */
export function attemptAsyncFlow<
	First extends GenericCallback,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
	Eighth,
	Ninth,
>(
	first: First,
	second: (value: Awaited<UnwrapValue<ReturnType<First>>>) => Second,
	third: (value: Awaited<UnwrapValue<Second>>) => Third,
	fourth: (value: Awaited<UnwrapValue<Third>>) => Fourth,
	fifth: (value: Awaited<UnwrapValue<Fourth>>) => Fifth,
	sixth: (value: Awaited<UnwrapValue<Fifth>>) => Sixth,
	seventh: (value: Awaited<UnwrapValue<Sixth>>) => Seventh,
	eighth: (value: Awaited<UnwrapValue<Seventh>>) => Eighth,
	ninth: (value: Awaited<UnwrapValue<Eighth>>) => Ninth,
): AttemptFlowPromise<First, Ninth>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 *
 * Available as `attemptAsyncFlow` and `attempt.flow.async`
 * @returns Flow function
 */
export function attemptAsyncFlow<
	First extends GenericCallback,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
	Eighth,
	Ninth,
	Tenth,
>(
	first: First,
	second: (value: Awaited<UnwrapValue<ReturnType<First>>>) => Second,
	third: (value: Awaited<UnwrapValue<Second>>) => Third,
	fourth: (value: Awaited<UnwrapValue<Third>>) => Fourth,
	fifth: (value: Awaited<UnwrapValue<Fourth>>) => Fifth,
	sixth: (value: Awaited<UnwrapValue<Fifth>>) => Sixth,
	seventh: (value: Awaited<UnwrapValue<Sixth>>) => Seventh,
	eighth: (value: Awaited<UnwrapValue<Seventh>>) => Eighth,
	ninth: (value: Awaited<UnwrapValue<Eighth>>) => Ninth,
	tenth: (value: Awaited<UnwrapValue<Ninth>>) => Tenth,
): AttemptFlowPromise<First, Tenth>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 *
 * Available as `attemptAsyncFlow` and `attempt.flow.async`
 * @returns Flow function
 */
export function attemptAsyncFlow<Fn extends GenericCallback>(
	fn: Fn,
	...fns: Array<(value: Awaited<UnwrapValue<ReturnType<Fn>>>) => unknown>
): AttemptFlowPromise<Fn, ReturnType<Fn>>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 *
 * Available as `attemptAsyncFlow` and `attempt.flow.async`
 * @returns Flow function
 */
export function attemptAsyncFlow(
	...fns: GenericCallback[]
): (...args: unknown[]) => Promise<Result<unknown>>;

export function attemptAsyncFlow(
	...fns: GenericCallback[]
): (...args: unknown[]) => Promise<Result<unknown>> {
	let Flow: GenericCallback;

	return (...args: unknown[]) =>
		attempt.async(() => {
			Flow ??= flow.async(...fns);

			return Flow(
				...args.map(value => {
					if (isError(value)) {
						throw value.error;
					}

					return isOk(value) ? value.value : value;
				}),
			);
		});
}

// #endregion

// #region Synchronous

/**
 * Create a Flow, a function that attempts to pipe values through a function
 *
 * Available as `attemptFlow` and `attempt.flow`
 * @returns Flow function
 */
export function attemptFlow<Fn extends GenericCallback>(fn: Fn): AttemptFlow<Fn, ReturnType<Fn>>;

/**
 * Create a Flow, a function that attempts to pipe values through a series of functions
 *
 * Available as `attemptFlow` and `attempt.flow`
 * @returns Flow function
 */
export function attemptFlow<First extends GenericCallback, Second>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
): AttemptFlow<First, Second>;

/**
 * Create a Flow, a function that attempts to pipe values through a series of functions
 *
 * Available as `attemptFlow` and `attempt.flow`
 * @returns Flow function
 */
export function attemptFlow<First extends GenericCallback, Second, Third>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
): AttemptFlow<First, Third>;

/**
 * Create a Flow, a function that attempts to pipe values through a series of functions
 *
 * Available as `attemptFlow` and `attempt.flow`
 * @returns Flow function
 */
export function attemptFlow<First extends GenericCallback, Second, Third, Fourth>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
): AttemptFlow<First, Fourth>;

/**
 * Create a Flow, a function that attempts to pipe values through a series of functions
 *
 * Available as `attemptFlow` and `attempt.flow`
 * @returns Flow function
 */
export function attemptFlow<First extends GenericCallback, Second, Third, Fourth, Fifth>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
): AttemptFlow<First, Fifth>;

/**
 * Create a Flow, a function that attempts to pipe values through a series of functions
 *
 * Available as `attemptFlow` and `attempt.flow`
 * @returns Flow function
 */
export function attemptFlow<First extends GenericCallback, Second, Third, Fourth, Fifth, Sixth>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
): AttemptFlow<First, Sixth>;

/**
 * Create a Flow, a function that attempts to pipe values through a series of functions
 *
 * Available as `attemptFlow` and `attempt.flow`
 * @returns Flow function
 */
export function attemptFlow<
	First extends GenericCallback,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
): AttemptFlow<First, Seventh>;

/**
 * Create a Flow, a function that attempts to pipe values through a series of functions
 *
 * Available as `attemptFlow` and `attempt.flow`
 * @returns Flow function
 */
export function attemptFlow<
	First extends GenericCallback,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
	Eighth,
>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
): AttemptFlow<First, Eighth>;

/**
 * Create a Flow, a function that attempts to pipe values through a series of functions
 *
 * Available as `attemptFlow` and `attempt.flow`
 * @returns Flow function
 */
export function attemptFlow<
	First extends GenericCallback,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
	Eighth,
	Ninth,
>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
	ninth: (value: UnwrapValue<Eighth>) => Ninth,
): AttemptFlow<First, Ninth>;

/**
 * Create a Flow, a function that attempts to pipe values through a series of functions
 *
 * Available as `attemptFlow` and `attempt.flow`
 * @returns Flow function
 */
export function attemptFlow<
	First extends GenericCallback,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
	Eighth,
	Ninth,
	Tenth,
>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
	ninth: (value: UnwrapValue<Eighth>) => Ninth,
	tenth: (value: UnwrapValue<Ninth>) => Tenth,
): AttemptFlow<First, Tenth>;

/**
 * Create a Flow, a function that attempts to pipe values through a series of functions
 *
 * Available as `attemptFlow` and `attempt.flow`
 * @returns Flow function
 */
export function attemptFlow<First extends GenericCallback>(
	first: First,
	...fns: Array<(value: UnwrapValue<ReturnType<First>>) => unknown>
): AttemptFlow<First, ReturnType<First>>;

/**
 * Create a Flow, a function that attempts to pipe values through a series of functions
 *
 * Available as `attemptFlow` and `attempt.flow`
 * @returns Flow function
 */
export function attemptFlow(...fns: GenericCallback[]): (...args: unknown[]) => Result<unknown>;

export function attemptFlow(...fns: GenericCallback[]): (...args: unknown[]) => Result<unknown> {
	let Flow: GenericCallback;

	return (...args: unknown[]) =>
		attempt(() => {
			Flow ??= flow(...fns);

			return Flow(
				...args.map(value => {
					if (isError(value)) {
						throw value.error;
					}

					return isOk(value) ? value.value : value;
				}),
			);
		});
}

attemptFlow.async = attemptAsyncFlow;

// #endregion

// #endregion
