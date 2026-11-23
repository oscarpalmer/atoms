import {pipe} from '../../internal/function/work';
import {attempt} from '../../internal/result/attempt';
import type {SyncFunctions, SyncInitial, SyncValue} from '../../models/function/work.model';
import type {GenericCallback, GenericSyncCallback} from '../../models/misc.model';
import type {Result, UnwrapValue} from '../../models/result.model';

// #region Types

type InitialAsyncPipeValue<Initial> =
	| GenericCallback
	| Initial
	| Promise<Initial>
	| Result<Initial>;

type InitialPipeValue<Initial> = GenericSyncCallback | Initial | Result<Initial>;

type SyncInitialValue<Initial> = SyncInitial<Initial, InitialPipeValue<Initial>>;

type WrapValue<Value> = Result<UnwrapValue<Value>>;

// #endregion

// #region Functions

/**
 * Attempt to pipe a value through a function
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export function attemptPipe<Initial, Pipe>(
	initial: SyncInitialValue<Initial>,
	pipe: (value: UnwrapValue<Initial>) => Pipe & SyncValue<Pipe>,
): WrapValue<Pipe>;

/**
 * Attempt to pipe a value through a series of functions
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export function attemptPipe<Initial, First, Second>(
	initial: SyncInitialValue<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
): WrapValue<Second>;

/**
 * Attempt to pipe a value through a series of functions
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export function attemptPipe<Initial, First, Second, Third>(
	initial: SyncInitialValue<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
): WrapValue<Third>;

/**
 * Attempt to pipe a value through a series of functions
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth>(
	initial: SyncInitialValue<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
): WrapValue<Fourth>;

/**
 * Attempt to pipe a value through a series of functions
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth, Fifth>(
	initial: SyncInitialValue<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
): WrapValue<Fifth>;

/**
 * Attempt to pipe a value through a series of functions
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth>(
	initial: SyncInitialValue<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
): WrapValue<Sixth>;

/**
 * Attempt to pipe a value through a series of functions
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh>(
	initial: SyncInitialValue<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
	seventh: (value: UnwrapValue<Sixth>) => Seventh & SyncValue<Seventh>,
): WrapValue<Seventh>;

/**
 * Attempt to pipe a value through a series of functions
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export function attemptPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth>(
	initial: SyncInitialValue<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
	seventh: (value: UnwrapValue<Sixth>) => Seventh & SyncValue<Seventh>,
	eighth: (value: UnwrapValue<Seventh>) => Eighth & SyncValue<Eighth>,
): WrapValue<Eighth>;

/**
 * Attempt to pipe a value through a series of functions
 *
 * @param initial Initial value
 * @returns _Piped_ result
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
	initial: SyncInitialValue<Initial>,
	first: (value: UnwrapValue<Initial>) => First & SyncValue<First>,
	second: (value: UnwrapValue<First>) => Second & SyncValue<Second>,
	third: (value: UnwrapValue<Second>) => Third & SyncValue<Third>,
	fourth: (value: UnwrapValue<Third>) => Fourth & SyncValue<Fourth>,
	fifth: (value: UnwrapValue<Fourth>) => Fifth & SyncValue<Fifth>,
	sixth: (value: UnwrapValue<Fifth>) => Sixth & SyncValue<Sixth>,
	seventh: (value: UnwrapValue<Sixth>) => Seventh & SyncValue<Seventh>,
	eighth: (value: UnwrapValue<Seventh>) => Eighth & SyncValue<Eighth>,
	ninth: (value: UnwrapValue<Eighth>) => Ninth & SyncValue<Ninth>,
): WrapValue<Ninth>;

/**
 * Attempt to pipe a value through a series of functions
 *
 * @param initial Initial value
 * @returns _Piped_ result
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
	initial: SyncInitialValue<Initial>,
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
): WrapValue<Tenth>;

/**
 * Attempt to pipe a value through a function
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export async function attemptPipe<Initial, Piped>(
	initial: InitialAsyncPipeValue<Initial>,
	pipe: (value: UnwrapValue<Initial>) => Piped,
): Promise<WrapValue<Piped>>;

/**
 * Attempt to pipe a value through a series of functions

 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export async function attemptPipe<Initial, First, Second>(
	initial: InitialAsyncPipeValue<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
): Promise<WrapValue<Second>>;

/**
 * Attempt to pipe a value through a series of functions
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export async function attemptPipe<Initial, First, Second, Third>(
	initial: InitialAsyncPipeValue<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
): Promise<WrapValue<Third>>;

/**
 * Attempt to pipe a value through a series of functions
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export async function attemptPipe<Initial, First, Second, Third, Fourth>(
	initial: InitialAsyncPipeValue<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
): Promise<WrapValue<Fourth>>;

/**
 * Attempt to pipe a value through a series of functions
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export async function attemptPipe<Initial, First, Second, Third, Fourth, Fifth>(
	initial: InitialAsyncPipeValue<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
): Promise<WrapValue<Fifth>>;

/**
 * Attempt to pipe a value through a series of functions
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export async function attemptPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth>(
	initial: InitialAsyncPipeValue<Initial>,
	first: (value: UnwrapValue<Initial>) => First,
	second: (value: UnwrapValue<First>) => Second,
	third: (value: UnwrapValue<Second>) => Third,
	fourth: (value: UnwrapValue<Third>) => Fourth,
	fifth: (value: UnwrapValue<Fourth>) => Fifth,
	sixth: (value: UnwrapValue<Fifth>) => Sixth,
): Promise<WrapValue<Sixth>>;

/**
 * Attempt to pipe a value through a series of functions
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export async function attemptPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh>(
	initial: InitialAsyncPipeValue<Initial>,
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
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export async function attemptPipe<
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
	initial: InitialAsyncPipeValue<Initial>,
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
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export async function attemptPipe<
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
	initial: InitialAsyncPipeValue<Initial>,
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
 *
 * @param initial Initial value
 * @returns _Piped_ result
 */
export async function attemptPipe<
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
	initial: InitialAsyncPipeValue<Initial>,
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
 *
 * @param initial Initial result
 * @returns _Piped_ result
 */
export function attemptPipe<Initial, Pipes extends Array<(value: any) => unknown>>(
	initial: SyncInitialValue<Initial>,
	...pipes: Pipes & SyncFunctions<Pipes>
): WrapValue<Initial>;

/**
 * Attempt to pipe a result through a series of functions
 *
 * @param initial Initial result
 * @returns _Piped_ result
 */
export async function attemptPipe<Initial>(
	initial: InitialAsyncPipeValue<Initial>,
	first?: (value: UnwrapValue<Initial>) => unknown,
	...seconds: Array<(value: any) => unknown>
): Promise<WrapValue<Initial>>;

export async function attemptPipe(
	initial: unknown,
	first?: (value: unknown) => unknown,
	...seconds: Array<(value: any) => unknown>
): Promise<Result<unknown>>;

export function attemptPipe(
	initial: unknown,
	first?: (value: unknown) => unknown,
	...seconds: Array<(value: unknown) => unknown>
): unknown {
	const fns = (first == null ? [] : [first, ...seconds]) as GenericCallback[];

	return attempt(() => pipe(initial, ...fns));
}

// #endregion
