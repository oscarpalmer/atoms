import type {GenericCallback} from '../../models';
import {
	assertFlowFunctions,
	assertPipeFunctions,
	type AsyncFlow,
	type Flow,
	WORK_MESSAGE_FLOW_PROMISE,
	WORK_MESSAGE_NESTING,
	WORK_MESSAGE_PIPE_PROMISE,
} from '../../models/function/work.model';
import type {UnwrapValue} from '../../models/result.model';
import {isError, isOk} from '../result/misc';

// #region Functions

// #region Flow

// #region Asynchronous

/**
 * Create an asynchronous _Flow_, a function that pipes values through a function
 *
 * _Available as `asyncFlow` and `flow.async`_
 *
 * @returns _Flow_ function
 */
export function asyncFlow<Fn extends GenericCallback>(fn: Fn): AsyncFlow<Fn, ReturnType<Fn>>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * _Available as `asyncFlow` and `flow.async`_
 *
 * @returns _Flow_ function
 */
export function asyncFlow<First extends GenericCallback, Second>(
	first: First,
	second: (value: Awaited<UnwrapValue<ReturnType<First>>>) => Second,
): AsyncFlow<First, Second>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * _Available as `asyncFlow` and `flow.async`_
 *
 * @returns _Flow_ function
 */
export function asyncFlow<First extends GenericCallback, Second, Third>(
	first: First,
	second: (value: Awaited<UnwrapValue<ReturnType<First>>>) => Second,
	third: (value: Awaited<UnwrapValue<Second>>) => Third,
): AsyncFlow<First, Third>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * _Available as `asyncFlow` and `flow.async`_
 *
 * @returns _Flow_ function
 */
export function asyncFlow<First extends GenericCallback, Second, Third, Fourth>(
	first: First,
	second: (value: Awaited<UnwrapValue<ReturnType<First>>>) => Second,
	third: (value: Awaited<UnwrapValue<Second>>) => Third,
	fourth: (value: Awaited<UnwrapValue<Third>>) => Fourth,
): AsyncFlow<First, Fourth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * _Available as `asyncFlow` and `flow.async`_
 *
 * @returns _Flow_ function
 */
export function asyncFlow<First extends GenericCallback, Second, Third, Fourth, Fifth>(
	first: First,
	second: (value: Awaited<UnwrapValue<ReturnType<First>>>) => Second,
	third: (value: Awaited<UnwrapValue<Second>>) => Third,
	fourth: (value: Awaited<UnwrapValue<Third>>) => Fourth,
	fifth: (value: Awaited<UnwrapValue<Fourth>>) => Fifth,
): AsyncFlow<First, Fifth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * _Available as `asyncFlow` and `flow.async`_
 *
 * @returns _Flow_ function
 */
export function asyncFlow<First extends GenericCallback, Second, Third, Fourth, Fifth, Sixth>(
	first: First,
	second: (value: Awaited<UnwrapValue<ReturnType<First>>>) => Second,
	third: (value: Awaited<UnwrapValue<Second>>) => Third,
	fourth: (value: Awaited<UnwrapValue<Third>>) => Fourth,
	fifth: (value: Awaited<UnwrapValue<Fourth>>) => Fifth,
	sixth: (value: Awaited<UnwrapValue<Fifth>>) => Sixth,
): AsyncFlow<First, Sixth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * _Available as `asyncFlow` and `flow.async`_
 *
 * @returns _Flow_ function
 */
export function asyncFlow<
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
): AsyncFlow<First, Seventh>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * _Available as `asyncFlow` and `flow.async`_
 *
 * @returns _Flow_ function
 */
export function asyncFlow<
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
): AsyncFlow<First, Eighth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * _Available as `asyncFlow` and `flow.async`_
 *
 * @returns _Flow_ function
 */
export function asyncFlow<
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
): AsyncFlow<First, Ninth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * _Available as `asyncFlow` and `flow.async`_
 *
 * @returns _Flow_ function
 */
export function asyncFlow<
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
): AsyncFlow<First, Tenth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * _Available as `asyncFlow` and `flow.async`_
 *
 * @returns _Flow_ function
 */
export function asyncFlow<Fn extends GenericCallback>(
	fn: Fn,
	...fns: Array<(value: Awaited<UnwrapValue<ReturnType<Fn>>>) => unknown>
): AsyncFlow<Fn, ReturnType<Fn>>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * _Available as `asyncFlow` and `flow.async`_
 *
 * @returns _Flow_ function
 */
export function asyncFlow(...fns: GenericCallback[]): (...args: unknown[]) => Promise<unknown>;

export function asyncFlow(...fns: GenericCallback[]): (...args: unknown[]) => Promise<unknown> {
	assertFlowFunctions(fns);

	return (...args: unknown[]): Promise<unknown> =>
		asyncWork(
			args.map(value => {
				if (isError(value)) {
					throw value.error;
				}

				return isOk(value) ? value.value : value;
			}),
			fns,
			true,
		);
}

// #endregion

// #region Synchronous

/**
 * Create a _Flow_, a function that pipes values through a function
 *
 * @returns _Flow_ function
 */
export function flow<Fn extends GenericCallback>(fn: Fn): Flow<Fn, ReturnType<Fn>>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericCallback, Second>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
): Flow<First, Second>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericCallback, Second, Third>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
): Flow<First, Third>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericCallback, Second, Third, Fourth>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
): Flow<First, Fourth>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericCallback, Second, Third, Fourth, Fifth>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
): Flow<First, Fifth>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericCallback, Second, Third, Fourth, Fifth, Sixth>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
): Flow<First, Sixth>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericCallback, Second, Third, Fourth, Fifth, Sixth, Seventh>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
): Flow<First, Seventh>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<
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
): Flow<First, Eighth>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<
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
): Flow<First, Ninth>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<
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
): Flow<First, Tenth>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericCallback>(
	first: First,
	...fns: Array<(value: UnwrapValue<ReturnType<First>>) => unknown>
): Flow<First, ReturnType<First>>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow(...fns: GenericCallback[]): (...args: unknown[]) => unknown;

export function flow(...fns: GenericCallback[]): (...args: unknown[]) => unknown {
	assertFlowFunctions(fns);

	return (...args: unknown[]): unknown =>
		work(
			args.map(value => {
				if (isError(value)) {
					throw value.error;
				}

				return isOk(value) ? value.value : value;
			}),
			fns,
			true,
		);
}

// #endregion

// #endregion

// #region Pipe

// #region Asynchronous

/**
 * Pipe a value through a function
 *
 * _Available as `asyncPipe` and `pipe.async`_
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function asyncPipe<Initial, Piped>(
	value: Initial,
	pipe: (value: UnwrapValue<Initial>) => Piped,
): Promise<UnwrapValue<Piped>>;

/**
 * Pipe a value through a series of functions
 *
 * _Available as `asyncPipe` and `pipe.async`_
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function asyncPipe<Initial, First, Second>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
): Promise<UnwrapValue<Second>>;

/**
 * Pipe a value through a series of functions
 *
 * _Available as `asyncPipe` and `pipe.async`_
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function asyncPipe<Initial, First, Second, Third>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
): Promise<UnwrapValue<Third>>;

/**
 * Pipe a value through a series of functions
 *
 * _Available as `asyncPipe` and `pipe.async`_
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function asyncPipe<Initial, First, Second, Third, Fourth>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
): Promise<UnwrapValue<Fourth>>;

/**
 * Pipe a value through a series of functions
 *
 * _Available as `asyncPipe` and `pipe.async`_
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function asyncPipe<Initial, First, Second, Third, Fourth, Fifth>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
): Promise<UnwrapValue<Fifth>>;

/**
 * Pipe a value through a series of functions
 *
 * _Available as `asyncPipe` and `pipe.async`_
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function asyncPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
): Promise<UnwrapValue<Sixth>>;

/**
 * Pipe a value through a series of functions
 *
 * _Available as `asyncPipe` and `pipe.async`_
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function asyncPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
): Promise<UnwrapValue<Seventh>>;

/**
 * Pipe a value through a series of functions
 *
 * _Available as `asyncPipe` and `pipe.async`_
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function asyncPipe<
	Initial,
	First,
	Second,
	Third,
	Fourth,
	Fifth,
	Sixth,
	Seventh,
	Eighth,
>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
): Promise<UnwrapValue<Eighth>>;

/**
 * Pipe a value through a series of functions
 *
 * _Available as `asyncPipe` and `pipe.async`_
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function asyncPipe<
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
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
	ninth: (value: UnwrapValue<Eighth>) => Ninth,
): Promise<UnwrapValue<Ninth>>;

/**
 * Pipe a value through a series of functions
 *
 * _Available as `asyncPipe` and `pipe.async`_
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function asyncPipe<
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
	value: Initial,
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
): Promise<UnwrapValue<Tenth>>;

/**
 * Pipe a value through a series of functions
 *
 * _Available as `asyncPipe` and `pipe.async`_
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function asyncPipe<Value>(
	value: Value,
	...pipes: Array<(value: Value) => Value>
): Promise<UnwrapValue<Value>>;

/**
 * Pipe a value through a series of functions
 *
 * _Available as `asyncPipe` and `pipe.async`_
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function asyncPipe(
	value: unknown,
	...pipes: Array<(value: unknown) => unknown>
): Promise<unknown>;

export async function asyncPipe(
	value: unknown,
	...pipes: Array<(value: unknown) => unknown>
): Promise<unknown> {
	assertPipeFunctions(pipes);

	return asyncWork(value, pipes, false);
}

// #endregion

// #region Synchronous

/**
 * Pipe a value through a function
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, Piped>(
	value: Initial,
	pipe: (value: UnwrapValue<Initial>) => Piped,
): UnwrapValue<Piped>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
): UnwrapValue<Second>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second, Third>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
): UnwrapValue<Third>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second, Third, Fourth>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
): UnwrapValue<Fourth>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
): UnwrapValue<Fifth>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
): UnwrapValue<Sixth>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
): UnwrapValue<Seventh>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
): UnwrapValue<Eighth>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth, Ninth>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
	seventh: (value: UnwrapValue<Sixth>) => Seventh,
	eighth: (value: UnwrapValue<Seventh>) => Eighth,
	ninth: (value: UnwrapValue<Eighth>) => Ninth,
): UnwrapValue<Ninth>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<
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
	value: Initial,
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
): UnwrapValue<Tenth>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Value>(
	value: Value,
	...pipes: Array<(value: Value) => Value>
): UnwrapValue<Value>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe(value: unknown, ...pipes: Array<(value: unknown) => unknown>): unknown;

export function pipe(value: unknown, ...pipes: GenericCallback[]): unknown {
	assertPipeFunctions(pipes);

	return work(value, pipes, false);
}

// #endregion

// #endregion

// #region Work

async function asyncWork(
	initial: unknown,
	functions: GenericCallback[],
	flow: boolean,
): Promise<unknown> {
	const {length} = functions;

	let transformed = unwrapValue(initial);

	for (let index = 0; index < length; index += 1) {
		const fn = functions[index];

		const value =
			flow && index === 0 && Array.isArray(initial) ? await fn(...initial) : await fn(transformed);

		transformed = unwrapValue(value);
	}

	return transformed;
}

function unwrapValue(value: unknown, flow?: boolean, nested?: boolean): unknown {
	if (typeof value === 'function') {
		if (nested != null) {
			throw new TypeError(WORK_MESSAGE_NESTING);
		}

		return unwrapValue(value(), flow, true);
	}

	if (flow != null && value instanceof Promise) {
		throw new TypeError(flow ? WORK_MESSAGE_FLOW_PROMISE : WORK_MESSAGE_PIPE_PROMISE);
	}

	if (isError(value)) {
		throw value.error;
	}

	return isOk(value) ? value.value : value;
}

function work(initial: unknown, functions: GenericCallback[], flow: boolean): unknown {
	const {length} = functions;

	let transformed = unwrapValue(initial, flow);

	for (let index = 0; index < length; index += 1) {
		const fn = functions[index];

		const value = flow && index === 0 && Array.isArray(initial) ? fn(...initial) : fn(transformed);

		transformed = unwrapValue(value, flow);
	}

	return transformed;
}

// #endregion

// #endregion

// #region Namespace

export declare namespace flow {
	export var async: typeof asyncFlow;
}

export declare namespace pipe {
	export var async: typeof asyncPipe;
}

// #endregion

// #region Initialization

flow.async = asyncFlow;
pipe.async = asyncPipe;

// #endregion

// #region Exports

export type {AsyncFlow, Flow};

// #endregion
