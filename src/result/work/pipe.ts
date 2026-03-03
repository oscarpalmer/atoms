import {pipe} from '../../function/work';
import {isError, isOk} from '../../internal/result';
import type {GenericCallback} from '../../models';
import {attempt} from '../index';
import type {Result, UnwrapValue} from '../models';

// #region Types

type WrapValue<Value> = Result<UnwrapValue<Value>>;

// #endregion

// #region Functions

// #region Asynchronous

/**
 * Attempt to pipe a result through a function
 * @param initial Initial result
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, Piped>(
	initial: Result<Initial>,
	pipe: (value: UnwrapValue<Initial>) => Piped,
): Promise<WrapValue<Piped>>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, First, Second>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
): Promise<WrapValue<Second>>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, First, Second, Third>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
): Promise<WrapValue<Third>>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, First, Second, Third, Fourth>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
): Promise<WrapValue<Fourth>>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, First, Second, Third, Fourth, Fifth>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
): Promise<WrapValue<Fifth>>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
): Promise<WrapValue<Sixth>>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
): Promise<WrapValue<Seventh>>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
): Promise<WrapValue<Eighth>>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
function attemptAsyncPipe<
	Initial,
	First,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
	Eighth,
	Ninth,
>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
	ninth: (value: UnwrapValue<Eighth>) => Ninth,
): Promise<WrapValue<Ninth>>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
function attemptAsyncPipe<
	Initial,
	First,
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
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
	ninth: (value: UnwrapValue<Eighth>) => Ninth,
	tenth: (value: UnwrapValue<Ninth>) => Tenth,
): Promise<WrapValue<Tenth>>;

/**
 * Attempt to pipe a value through a function
 * @param initial Initial value
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, Piped>(
	initial: GenericCallback | Initial,
	pipe: (value: UnwrapValue<Initial>) => Piped,
): Promise<WrapValue<Piped>>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, First, Second>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
): Promise<WrapValue<Second>>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, First, Second, Third>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
): Promise<WrapValue<Third>>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, First, Second, Third, Fourth>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
): Promise<WrapValue<Fourth>>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, First, Second, Third, Fourth, Fifth>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
): Promise<WrapValue<Fifth>>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
): Promise<WrapValue<Sixth>>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
): Promise<WrapValue<Seventh>>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
function attemptAsyncPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
): Promise<WrapValue<Eighth>>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
function attemptAsyncPipe<
	Initial,
	First,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
	Eighth,
	Ninth,
>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
	ninth: (value: UnwrapValue<Eighth>) => Ninth,
): Promise<WrapValue<Ninth>>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
function attemptAsyncPipe<
	Initial,
	First,
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
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
	ninth: (value: UnwrapValue<Eighth>) => Ninth,
	tenth: (value: UnwrapValue<Ninth>) => Tenth,
): Promise<WrapValue<Tenth>>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
function attemptAsyncPipe<Initial>(
	initial: Result<Initial>,
	first?: (value: UnwrapValue<Initial>) => unknown,
	...seconds: Array<(value: unknown) => unknown>
): Promise<WrapValue<Initial>>;

/**
 * Attempt to pipe an item through a series of functions
 * @param item Initial value
 * @returns Piped result
 */
function attemptAsyncPipe<Initial>(
	initial: GenericCallback | Initial,
	first?: (value: UnwrapValue<Initial>) => unknown,
	...seconds: Array<(value: unknown) => unknown>
): Promise<WrapValue<Initial>>;

async function attemptAsyncPipe(
	initial: unknown,
	first?: (value: unknown) => unknown,
	...seconds: Array<(value: unknown) => unknown>
): Promise<Result<unknown>> {
	return attempt.async(() => {
		if (isError(initial)) {
			throw initial.error;
		}

		const value =
			typeof initial === 'function'
				? (initial as Function)()
				: isOk(initial)
					? initial.value
					: initial;

		if (first == null) {
			return value;
		}

		return pipe.async(value, ...([first, ...seconds] as GenericCallback[]));
	});
}

// #endregion

// #region Synchronous

/**
 * Attempt to pipe a result through a function
 * @param initial Initial result
 * @returns Piped result
 */
export function attemptPipe<Initial, Piped>(
	initial: Result<Initial>,
	pipe: (value: UnwrapValue<Initial>) => Piped,
): WrapValue<Piped>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
export function attemptPipe<Initial, First, Second>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
): WrapValue<Second>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
export function attemptPipe<Initial, First, Second, Third>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
): WrapValue<Third>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
): WrapValue<Fourth>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth, Fifth>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
): WrapValue<Fifth>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
): WrapValue<Sixth>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
): WrapValue<Seventh>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
): WrapValue<Eighth>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
export function attemptPipe<
	Initial,
	First,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
	Eighth,
	Ninth,
>(
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
	ninth: (value: UnwrapValue<Eighth>) => Ninth,
): WrapValue<Ninth>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
export function attemptPipe<
	Initial,
	First,
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
	initial: Result<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
	ninth: (value: UnwrapValue<Eighth>) => Ninth,
	tenth: (value: UnwrapValue<Ninth>) => Tenth,
): WrapValue<Tenth>;

/**
 * Attempt to pipe a value through a function
 * @param initial Initial value
 * @returns Piped result
 */
export function attemptPipe<Initial, Pipe>(
	initial: GenericCallback | Initial,
	pipe: (value: UnwrapValue<Initial>) => Pipe,
): WrapValue<Pipe>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
export function attemptPipe<Initial, First, Second>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
): WrapValue<Second>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
export function attemptPipe<Initial, First, Second, Third>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
): WrapValue<Third>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
): WrapValue<Fourth>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth, Fifth>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
): WrapValue<Fifth>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
): WrapValue<Sixth>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
): WrapValue<Seventh>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
): WrapValue<Eighth>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
export function attemptPipe<
	Initial,
	First,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
	Eighth,
	Ninth,
>(
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
	ninth: (value: UnwrapValue<Eighth>) => Ninth,
): WrapValue<Ninth>;

/**
 * Attempt to pipe a value through a series of functions
 * @param initial Initial value
 * @returns Piped result
 */
export function attemptPipe<
	Initial,
	First,
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
	initial: GenericCallback | Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
	ninth: (value: UnwrapValue<Eighth>) => Ninth,
	tenth: (value: UnwrapValue<Ninth>) => Tenth,
): WrapValue<Tenth>;

/**
 * Attempt to pipe a result through a series of functions
 * @param initial Initial result
 * @returns Piped result
 */
export function attemptPipe<Initial>(
	initial: Result<Initial>,
	first?: (value: UnwrapValue<Initial>) => unknown,
	...seconds: Array<(value: unknown) => unknown>
): WrapValue<Initial>;

/**
 * Attempt to pipe an item through a series of functions
 * @param item Initial value
 * @returns Piped result
 */
export function attemptPipe<Initial>(
	initial: GenericCallback | Initial,
	first?: (value: UnwrapValue<Initial>) => unknown,
	...seconds: Array<(value: unknown) => unknown>
): WrapValue<Initial>;

export function attemptPipe(
	initial: unknown,
	first?: (value: unknown) => unknown,
	...seconds: Array<(value: unknown) => unknown>
): WrapValue<unknown> {
	return attempt(() => {
		if (isError(initial)) {
			throw initial.error;
		}

		const value =
			typeof initial === 'function'
				? (initial as Function)()
				: isOk(initial)
					? initial.value
					: initial;

		if (first == null) {
			return value;
		}

		return pipe(value, ...([first, ...seconds] as GenericCallback[]));
	});
}

attemptPipe.async = attemptAsyncPipe;

// #endregion

// #endregion
