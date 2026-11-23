import type {Asserter} from '../../models/function/assert.model';
import {
	type AsyncFlow,
	type Flow,
	type SyncFunctions,
	type SyncInitial,
	type SyncValue,
	WORK_MESSAGE_FLOW_ARRAY,
	WORK_MESSAGE_FLOW_PROMISE,
	WORK_MESSAGE_NESTING,
	WORK_MESSAGE_PIPE_ARRAY,
	WORK_MESSAGE_PIPE_PROMISE,
} from '../../models/function/work.model';
import type {GenericCallback, GenericSyncCallback} from '../../models/misc.model';
import type {UnwrapValue} from '../../models/result.model';
import {assert} from '../function/assert';
import {isAsyncFunction, isThenable} from '../is';
import {swallow} from '../promise';
import {unwrapWork} from './misc';

// #region Functions

// #region Flow

/**
 * Create a _Flow_, a function that pipes values through a function
 *
 * @returns _Flow_ function
 */
export function flow<Fn extends GenericSyncCallback>(
	fn: Fn & SyncValue<ReturnType<Fn>>,
): Flow<Fn, ReturnType<Fn>>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericSyncCallback, Second>(
	first: First & SyncValue<ReturnType<First>>,
	second: (value: UnwrapValue<ReturnType<First>>) => Second & SyncValue<Second>,
): Flow<First, Second>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericSyncCallback, Second, Third>(
	first: First & SyncValue<ReturnType<First>>,
	second: (value: UnwrapValue<ReturnType<First>>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
): Flow<First, Third>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericSyncCallback, Second, Third, Fourth>(
	first: First & SyncValue<ReturnType<First>>,
	second: (value: UnwrapValue<ReturnType<First>>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
): Flow<First, Fourth>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericSyncCallback, Second, Third, Fourth, Fifth>(
	first: First & SyncValue<ReturnType<First>>,
	second: (value: UnwrapValue<ReturnType<First>>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
): Flow<First, Fifth>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericSyncCallback, Second, Third, Fourth, Fifth, Sixth>(
	first: First & SyncValue<ReturnType<First>>,
	second: (value: UnwrapValue<ReturnType<First>>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
): Flow<First, Sixth>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<
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
): Flow<First, Seventh>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<
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
): Flow<First, Eighth>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<
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
): Flow<First, Ninth>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<
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
): Flow<First, Tenth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a function
 *
 * @returns _Flow_ function
 */
export function flow<Fn extends GenericCallback>(fn: Fn): AsyncFlow<Fn, ReturnType<Fn>>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericCallback, Second>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
): AsyncFlow<First, Second>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericCallback, Second, Third>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
): AsyncFlow<First, Third>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericCallback, Second, Third, Fourth>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
): AsyncFlow<First, Fourth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<First extends GenericCallback, Second, Third, Fourth, Fifth>(
	first: First,
	second: (value: UnwrapValue<ReturnType<First>>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
): AsyncFlow<First, Fifth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions

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
): AsyncFlow<First, Sixth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
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
): AsyncFlow<First, Seventh>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
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
): AsyncFlow<First, Eighth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions

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
): AsyncFlow<First, Ninth>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
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
): AsyncFlow<First, Tenth>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<
	First extends GenericSyncCallback,
	Fns extends Array<(value: UnwrapValue<ReturnType<First>>) => unknown>,
>(
	first: First & SyncValue<ReturnType<First>>,
	...fns: Fns & SyncFunctions<Fns>
): Flow<First, ReturnType<First>>;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<Fn extends GenericCallback>(
	fn: Fn,
	...fns: Array<(value: UnwrapValue<ReturnType<Fn>>) => unknown>
): AsyncFlow<Fn, ReturnType<Fn>>;

/**
 * Create a _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow<Fns extends GenericSyncCallback[]>(
	...fns: Fns & SyncFunctions<Fns>
): (...args: unknown[]) => unknown;

/**
 * Create an asynchronous _Flow_, a function that pipes values through a series of functions
 *
 * @returns _Flow_ function
 */
export function flow(...fns: GenericCallback[]): (...args: unknown[]) => Promise<unknown>;

export function flow(...fns: GenericCallback[]): unknown {
	assertFlowFunctions(fns);

	return fns.some(isAsyncFunction)
		? (...args: unknown[]): Promise<unknown> => asyncWork(args.map(unwrapWork), fns, true)
		: (...args: unknown[]): unknown => work(args.map(unwrapWork), fns, true);
}

// #endregion

// #region Pipe

/**
 * Pipe a value through a function
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, Piped>(
	value: SyncInitial<Initial>,
	pipe: (value: UnwrapValue<Initial>) => Piped & SyncValue<Piped>,
): UnwrapValue<Piped>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second>(
	value: SyncInitial<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
): UnwrapValue<Second>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second, Third>(
	value: SyncInitial<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
): UnwrapValue<Third>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second, Third, Fourth>(
	value: SyncInitial<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
): UnwrapValue<Fourth>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth>(
	value: SyncInitial<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
): UnwrapValue<Fifth>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth>(
	value: SyncInitial<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
): UnwrapValue<Sixth>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh>(
	value: SyncInitial<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
	seventh: (value: UnwrapValue<Sixth>) => Seventh & SyncValue<Seventh>,
): UnwrapValue<Seventh>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth>(
	value: SyncInitial<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
	seventh: (value: UnwrapValue<Sixth>) => Seventh & SyncValue<Seventh>,
	eighth: (value: UnwrapValue<Seventh>) => Eighth & SyncValue<Eighth>,
): UnwrapValue<Eighth>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth, Ninth>(
	value: SyncInitial<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
	seventh: (value: UnwrapValue<Sixth>) => Seventh & SyncValue<Seventh>,
	eighth: (value: UnwrapValue<Seventh>) => Eighth & SyncValue<Eighth>,
	ninth: (value: UnwrapValue<Eighth>) => Ninth & SyncValue<Ninth>,
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
	value: SyncInitial<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
	seventh: (value: UnwrapValue<Sixth>) => Seventh & SyncValue<Seventh>,
	eighth: (value: UnwrapValue<Seventh>) => Eighth & SyncValue<Eighth>,
	ninth: (value: UnwrapValue<Eighth>) => Ninth & SyncValue<Ninth>,
	tenth: (value: UnwrapValue<Ninth>) => Tenth & SyncValue<Tenth>,
): UnwrapValue<Tenth>;

/**
 * Pipe a value through a function
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function pipe<Initial, Piped>(
	value: Initial,
	pipe: (value: UnwrapValue<Initial>) => Piped,
): Promise<UnwrapValue<Piped>>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function pipe<Initial, First, Second>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
): Promise<UnwrapValue<Second>>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function pipe<Initial, First, Second, Third>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
): Promise<UnwrapValue<Third>>;

/**
 * Pipe a value through a series of functions

 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function pipe<Initial, First, Second, Third, Fourth>(
	value: Initial,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
): Promise<UnwrapValue<Fourth>>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function pipe<Initial, First, Second, Third, Fourth, Fifth>(
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
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth>(
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
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh>(
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
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth>(
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
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function pipe<
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
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function pipe<
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
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Value>(
	value: SyncInitial<Value>,
	...pipes: Array<(value: Value) => Value>
): UnwrapValue<Value>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function pipe<Value>(
	value: Value,
	...pipes: Array<(value: Value) => Value>
): Promise<UnwrapValue<Value>>;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export function pipe<Initial, Pipes extends Array<(value: any) => unknown>>(
	value: SyncInitial<Initial>,
	...pipes: Pipes & SyncFunctions<Pipes>
): unknown;

/**
 * Pipe a value through a series of functions
 *
 * @param value Initial value
 * @returns _Piped_ result
 */
export async function pipe(
	value: unknown,
	...pipes: Array<(value: any) => unknown>
): Promise<unknown>;

export function pipe(value: unknown, ...fns: GenericCallback[]): unknown {
	assertPipeFunctions(fns);

	return fns.some(isAsyncFunction) || isAsyncInitial(value)
		? asyncWork(value, fns, false)
		: work(value, fns, false);
}

// #endregion

// #region Work

async function asyncWork(
	initial: unknown,
	functions: GenericCallback[],
	flow: boolean,
): Promise<unknown> {
	const {length} = functions;

	initial = unwrapValue(initial);

	let transformed = isThenable(initial) ? unwrapWork(await initial) : initial;

	for (let index = 0; index < length; index += 1) {
		const fn = functions[index];

		const value =
			flow && index === 0 && Array.isArray(initial) ? await fn(...initial) : await fn(transformed);

		const unwrapped = unwrapValue(value);

		transformed = isThenable(unwrapped) ? unwrapWork(await unwrapped) : unwrapped;
	}

	return transformed;
}

function isAsyncInitial(value: unknown): boolean {
	return isThenable(value) || isAsyncFunction(value);
}

function unwrapValue(value: unknown, flow?: boolean, nested?: boolean): unknown {
	if (typeof value === 'function') {
		if (nested != null) {
			throw new TypeError(WORK_MESSAGE_NESTING);
		}

		return unwrapValue(value(), flow, true);
	}

	if (flow != null && isThenable(value)) {
		swallow(value);

		throw new TypeError(flow ? WORK_MESSAGE_FLOW_PROMISE : WORK_MESSAGE_PIPE_PROMISE);
	}

	return unwrapWork(value);
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

// #region Variables

export const assertFlowFunctions: Asserter<Function[]> = assert.condition(
	value => Array.isArray(value) && value.every(item => typeof item === 'function'),
	WORK_MESSAGE_FLOW_ARRAY,
	TypeError,
);

export const assertPipeFunctions: Asserter<Function[]> = assert.condition(
	value => Array.isArray(value) && value.every(item => typeof item === 'function'),
	WORK_MESSAGE_PIPE_ARRAY,
	TypeError,
);

// #endregion
