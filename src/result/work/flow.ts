import {unwrapWork} from '../../internal/function/misc';
import {flow} from '../../internal/function/work';
import {isAsyncFunction} from '../../internal/is';
import type {SyncFunctions, SyncValue} from '../../models/function/work.model';
import type {GenericCallback, GenericSyncCallback} from '../../models/index';
import type {AttemptAsyncFlow, AttemptFlow, Result, UnwrapValue} from '../../models/result.model';
import {attempt} from '../index';

// #region Functions

/**
 * Create a _Flow_, a function that attempts to pipe values through a function
 *
 * @returns _Flow_ function
 */
export function attemptFlow<Fn extends GenericSyncCallback>(
	fn: Fn & SyncValue<ReturnType<Fn>>,
): AttemptFlow<Fn, ReturnType<Fn>>;

/**
 * Create a _Flow_, a function that attempts to pipe values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<First extends GenericSyncCallback, Second>(
	first: First & SyncValue<ReturnType<First>>,
	second: (value: UnwrapValue<ReturnType<First>>) => Second & SyncValue<Second>,
): AttemptFlow<First, Second>;

/**
 * Create a _Flow_, a function that attempts to pipe values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<First extends GenericSyncCallback, Second, Third>(
	first: First & SyncValue<ReturnType<First>>,
	second: (value: UnwrapValue<ReturnType<First>>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
): AttemptFlow<First, Third>;

/**
 * Create a _Flow_, a function that attempts to pipe values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<First extends GenericSyncCallback, Second, Third, Fourth>(
	first: First & SyncValue<ReturnType<First>>,
	second: (value: UnwrapValue<ReturnType<First>>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
): AttemptFlow<First, Fourth>;

/**
 * Create a _Flow_, a function that attempts to pipe values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<First extends GenericSyncCallback, Second, Third, Fourth, Fifth>(
	first: First & SyncValue<ReturnType<First>>,
	second: (value: UnwrapValue<ReturnType<First>>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
): AttemptFlow<First, Fifth>;

/**
 * Create a _Flow_, a function that attempts to pipe values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<First extends GenericSyncCallback, Second, Third, Fourth, Fifth, Sixth>(
	first: First & SyncValue<ReturnType<First>>,
	second: (value: UnwrapValue<ReturnType<First>>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
): AttemptFlow<First, Sixth>;

/**
 * Create a _Flow_, a function that attempts to pipe values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<
	First extends GenericSyncCallback,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
>(
	first: First & SyncValue<ReturnType<First>>,
	second: (value: UnwrapValue<ReturnType<First>>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
	seventh: (value: UnwrapValue<Sixth>) => Seventh & SyncValue<Seventh>,
): AttemptFlow<First, Seventh>;

/**
 * Create a _Flow_, a function that attempts to pipe values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<
	First extends GenericSyncCallback,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
	Eighth,
>(
	first: First & SyncValue<ReturnType<First>>,
	second: (value: UnwrapValue<ReturnType<First>>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
	seventh: (value: UnwrapValue<Sixth>) => Seventh & SyncValue<Seventh>,
	eighth: (value: UnwrapValue<Seventh>) => Eighth & SyncValue<Eighth>,
): AttemptFlow<First, Eighth>;

/**
 * Create a _Flow_, a function that attempts to pipe values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<
	First extends GenericSyncCallback,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
	Eighth,
	Ninth,
>(
	first: First & SyncValue<ReturnType<First>>,
	second: (value: UnwrapValue<ReturnType<First>>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
	seventh: (value: UnwrapValue<Sixth>) => Seventh & SyncValue<Seventh>,
	eighth: (value: UnwrapValue<Seventh>) => Eighth & SyncValue<Eighth>,
	ninth: (value: UnwrapValue<Eighth>) => Ninth & SyncValue<Ninth>,
): AttemptFlow<First, Ninth>;

/**
 * Create a _Flow_, a function that attempts to pipe values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<
	First extends GenericSyncCallback,
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
	first: First & SyncValue<ReturnType<First>>,
	second: (value: UnwrapValue<ReturnType<First>>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
	seventh: (value: UnwrapValue<Sixth>) => Seventh & SyncValue<Seventh>,
	eighth: (value: UnwrapValue<Seventh>) => Eighth & SyncValue<Eighth>,
	ninth: (value: UnwrapValue<Eighth>) => Ninth & SyncValue<Ninth>,
	tenth: (value: UnwrapValue<Ninth>) => Tenth & SyncValue<Tenth>,
): AttemptFlow<First, Tenth>;

/**
 * Create an asynchronous _Flow_, a function that attempts to pipe a value through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<Fn extends GenericCallback>(
	fn: Fn,
): AttemptAsyncFlow<Fn, ReturnType<Fn>>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<First extends GenericCallback, Second>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
): AttemptAsyncFlow<First, Second>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<First extends GenericCallback, Second, Third>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
): AttemptAsyncFlow<First, Third>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<First extends GenericCallback, Second, Third, Fourth>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
): AttemptAsyncFlow<First, Fourth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<First extends GenericCallback, Second, Third, Fourth, Fifth>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
): AttemptAsyncFlow<First, Fifth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<First extends GenericCallback, Second, Third, Fourth, Fifth, Sixth>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
): AttemptAsyncFlow<First, Sixth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
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
): AttemptAsyncFlow<First, Seventh>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
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
): AttemptAsyncFlow<First, Eighth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
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
): AttemptAsyncFlow<First, Ninth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
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
): AttemptAsyncFlow<First, Tenth>;

/**
 * Create a _Flow_, a function that attempts to pipe values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<
	First extends GenericSyncCallback,
	Fns extends Array<(value: UnwrapValue<ReturnType<First>>) => unknown>,
>(
	first: First & SyncValue<ReturnType<First>>,
	...fns: Fns & SyncFunctions<Fns>
): AttemptFlow<First, ReturnType<First>>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<Fn extends GenericCallback>(
	fn: Fn,
	...fns: Array<(value: UnwrapValue<ReturnType<Fn>>) => unknown>
): AttemptAsyncFlow<Fn, ReturnType<Fn>>;

/**
 * Create a _Flow_, a function that attempts to pipe values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow<Fns extends GenericSyncCallback[]>(
	...fns: Fns & SyncFunctions<Fns>
): (...args: unknown[]) => Result<unknown>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function attemptFlow(
	...fns: GenericCallback[]
): (...args: unknown[]) => Promise<Result<unknown>>;

export function attemptFlow(...fns: GenericCallback[]): unknown {
	let Flow: GenericCallback;

	if (fns.some(isAsyncFunction)) {
		return (...args: unknown[]) =>
			attempt(() => {
				Flow ??= flow(...fns);

				return Flow(...args.map(unwrapWork));
			}) as Promise<Result<unknown>>;
	}

	return (...args: unknown[]) =>
		attempt(() => {
			Flow ??= flow(...fns);

			return Flow(...args.map(unwrapWork));
		}) as Result<unknown>;
}

// #endregion
