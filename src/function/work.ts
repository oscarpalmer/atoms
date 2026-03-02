import type {GenericCallback} from '../models';
import {assert, type Asserter} from './assert';

// #region Types

/**
 * A synchronous Flow, a function that pipes values through a series of functions
 */
export type Flow<Callback extends GenericCallback, Value = ReturnType<Callback>> = (
	...args: Parameters<Callback>
) => Value;

/**
 * An asynchronous Flow, a function that pipes values through a series of functions
 */
export type FlowPromise<Callback extends GenericCallback, Value = ReturnType<Callback>> = (
	...args: Parameters<Callback>
) => Promise<Awaited<Value>>;

// #endregion

// #region Functions

// #region Flow

// #region Asynchronous

/**
 * Create an asynchronous Flow, a function that pipes values through a function
 * @returns Flow function
 */
function asyncFlow<Fn extends GenericCallback>(fn: Fn): FlowPromise<Fn>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
function asyncFlow<First extends GenericCallback, Second>(
	first: First,
	second: (value: Awaited<ReturnType<First>>) => Second,
): FlowPromise<First, Second>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
function asyncFlow<First extends GenericCallback, Second, Third>(
	first: First,
	second: (value: Awaited<ReturnType<First>>) => Second,
	third: (value: Awaited<Second>) => Third,
): FlowPromise<First, Third>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
function asyncFlow<First extends GenericCallback, Second, Third, Fourth>(
	first: First,
	second: (value: Awaited<ReturnType<First>>) => Second,
	third: (value: Awaited<Second>) => Third,
	fourth: (value: Awaited<Third>) => Fourth,
): FlowPromise<First, Fourth>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
function asyncFlow<First extends GenericCallback, Second, Third, Fourth, Fifth>(
	first: First,
	second: (value: Awaited<ReturnType<First>>) => Second,
	third: (value: Awaited<Second>) => Third,
	fourth: (value: Awaited<Third>) => Fourth,
	fifth: (value: Awaited<Fourth>) => Fifth,
): FlowPromise<First, Fifth>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
function asyncFlow<First extends GenericCallback, Second, Third, Fourth, Fifth, Sixth>(
	first: First,
	second: (value: Awaited<ReturnType<First>>) => Second,
	third: (value: Awaited<Second>) => Third,
	fourth: (value: Awaited<Third>) => Fourth,
	fifth: (value: Awaited<Fourth>) => Fifth,
	sixth: (value: Awaited<Fifth>) => Sixth,
): FlowPromise<First, Sixth>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
function asyncFlow<First extends GenericCallback, Second, Third, Fourth, Fifth, Sixth, Seventh>(
	first: First,
	second: (value: Awaited<ReturnType<First>>) => Second,
	third: (value: Awaited<Second>) => Third,
	fourth: (value: Awaited<Third>) => Fourth,
	fifth: (value: Awaited<Fourth>) => Fifth,
	sixth: (value: Awaited<Fifth>) => Sixth,
	seventh: (value: Awaited<Sixth>) => Seventh,
): FlowPromise<First, Seventh>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
function asyncFlow<
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
	second: (value: Awaited<ReturnType<First>>) => Second,
	third: (value: Awaited<Second>) => Third,
	fourth: (value: Awaited<Third>) => Fourth,
	fifth: (value: Awaited<Fourth>) => Fifth,
	sixth: (value: Awaited<Fifth>) => Sixth,
	seventh: (value: Awaited<Sixth>) => Seventh,
	eighth: (value: Awaited<Seventh>) => Eighth,
): FlowPromise<First, Eighth>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
function asyncFlow<
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
	second: (value: Awaited<ReturnType<First>>) => Second,
	third: (value: Awaited<Second>) => Third,
	fourth: (value: Awaited<Third>) => Fourth,
	fifth: (value: Awaited<Fourth>) => Fifth,
	sixth: (value: Awaited<Fifth>) => Sixth,
	seventh: (value: Awaited<Sixth>) => Seventh,
	eighth: (value: Awaited<Seventh>) => Eighth,
	ninth: (value: Awaited<Eighth>) => Ninth,
): FlowPromise<First, Ninth>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
function asyncFlow<
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
	second: (value: Awaited<ReturnType<First>>) => Second,
	third: (value: Awaited<Second>) => Third,
	fourth: (value: Awaited<Third>) => Fourth,
	fifth: (value: Awaited<Fourth>) => Fifth,
	sixth: (value: Awaited<Fifth>) => Sixth,
	seventh: (value: Awaited<Sixth>) => Seventh,
	eighth: (value: Awaited<Seventh>) => Eighth,
	ninth: (value: Awaited<Eighth>) => Ninth,
	tenth: (value: Awaited<Ninth>) => Tenth,
): FlowPromise<First, Tenth>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
function asyncFlow<Fn extends GenericCallback>(
	fn: Fn,
	...fns: Array<(value: Awaited<ReturnType<Fn>>) => unknown>
): FlowPromise<Fn>;

/**
 * Create an asynchronous Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
function asyncFlow(...fns: Function[]): (...args: unknown[]) => Promise<unknown>;

function asyncFlow(...fns: Function[]): (...args: unknown[]) => Promise<unknown> {
	assertFlowFunctions(fns);

	return (...args: unknown[]): Promise<unknown> => asyncWork(args, fns, true);
}

// #endregion

// #region Synchronous

/**
 * Create a Flow, a function that pipes values through a function
 * @returns Flow function
 */
export function flow<Fn extends GenericCallback>(fn: Fn): Flow<Fn>;

/**
 * Create a Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
export function flow<First extends GenericCallback, Second>(
	first: First,
	second: (value: ReturnType<First>) => Second,
): Flow<First, Second>;

/**
 * Create a Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
export function flow<First extends GenericCallback, Second, Third>(
	first: First,
	second: (value: ReturnType<First>) => Second,
	third: (value: Second) => Third,
): Flow<First, Third>;

/**
 * Create a Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
export function flow<First extends GenericCallback, Second, Third, Fourth>(
	first: First,
	second: (value: ReturnType<First>) => Second,
	third: (value: Second) => Third,
	fourth: (value: Third) => Fourth,
): Flow<First, Fourth>;

/**
 * Create a Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
export function flow<First extends GenericCallback, Second, Third, Fourth, Fifth>(
	first: First,
	second: (value: ReturnType<First>) => Second,
	third: (value: Second) => Third,
	fourth: (value: Third) => Fourth,
	fifth: (value: Fourth) => Fifth,
): Flow<First, Fifth>;

/**
 * Create a Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
export function flow<First extends GenericCallback, Second, Third, Fourth, Fifth, Sixth>(
	first: First,
	second: (value: ReturnType<First>) => Second,
	third: (value: Second) => Third,
	fourth: (value: Third) => Fourth,
	fifth: (value: Fourth) => Fifth,
	sixth: (value: Fifth) => Sixth,
): Flow<First, Sixth>;

/**
 * Create a Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
export function flow<First extends GenericCallback, Second, Third, Fourth, Fifth, Sixth, Seventh>(
	first: First,
	second: (value: ReturnType<First>) => Second,
	third: (value: Second) => Third,
	fourth: (value: Third) => Fourth,
	fifth: (value: Fourth) => Fifth,
	sixth: (value: Fifth) => Sixth,
	seventh: (value: Sixth) => Seventh,
): Flow<First, Seventh>;

/**
 * Create a Flow, a function that pipes values through a series of functions
 * @returns Flow function
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
	second: (value: ReturnType<First>) => Second,
	third: (value: Second) => Third,
	fourth: (value: Third) => Fourth,
	fifth: (value: Fourth) => Fifth,
	sixth: (value: Fifth) => Sixth,
	seventh: (value: Sixth) => Seventh,
	eighth: (value: Seventh) => Eighth,
): Flow<First, Eighth>;

/**
 * Create a Flow, a function that pipes values through a series of functions
 * @returns Flow function
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
	second: (value: ReturnType<First>) => Second,
	third: (value: Second) => Third,
	fourth: (value: Third) => Fourth,
	fifth: (value: Fourth) => Fifth,
	sixth: (value: Fifth) => Sixth,
	seventh: (value: Sixth) => Seventh,
	eighth: (value: Seventh) => Eighth,
	ninth: (value: Eighth) => Ninth,
): Flow<First, Ninth>;

/**
 * Create a Flow, a function that pipes values through a series of functions
 * @returns Flow function
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
	second: (value: ReturnType<First>) => Second,
	third: (value: Second) => Third,
	fourth: (value: Third) => Fourth,
	fifth: (value: Fourth) => Fifth,
	sixth: (value: Fifth) => Sixth,
	seventh: (value: Sixth) => Seventh,
	eighth: (value: Seventh) => Eighth,
	ninth: (value: Eighth) => Ninth,
	tenth: (value: Ninth) => Tenth,
): Flow<First, Tenth>;

/**
 * Create a Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
export function flow<First extends GenericCallback>(
	first: First,
	...fns: Array<(value: ReturnType<First>) => unknown>
): Flow<First>;

/**
 * Create a Flow, a function that pipes values through a series of functions
 * @returns Flow function
 */
export function flow(...fns: Function[]): (...args: unknown[]) => unknown;

export function flow(...fns: Function[]): (...args: unknown[]) => unknown {
	assertFlowFunctions(fns);

	return (...args: unknown[]): unknown => work(args, fns, true);
}

flow.async = asyncFlow;

// #endregion

// #endregion

// #region Pipe

// #region Asynchronous

/**
 * Pipe a value through a function
 * @param value Initial value
 * @returns Piped result
 */
async function asyncPipe<Initial, Pipe>(
	value: Initial,
	pipe: (value: Initial) => Pipe,
): Promise<Awaited<Pipe>>;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
async function asyncPipe<Initial, First, Second>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: Awaited<First>) => Second,
): Promise<Awaited<Second>>;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
async function asyncPipe<Initial, First, Second, Third>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: Awaited<First>) => Second,
	third: (value: Awaited<Second>) => Third,
): Promise<Awaited<Third>>;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
async function asyncPipe<Initial, First, Second, Third, Fourth>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: Awaited<First>) => Second,
	third: (value: Awaited<Second>) => Third,
	fourth: (value: Awaited<Third>) => Fourth,
): Promise<Awaited<Fourth>>;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
async function asyncPipe<Initial, First, Second, Third, Fourth, Fifth>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: Awaited<First>) => Second,
	third: (value: Awaited<Second>) => Third,
	fourth: (value: Awaited<Third>) => Fourth,
	fifth: (value: Awaited<Fourth>) => Fifth,
): Promise<Awaited<Fifth>>;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
async function asyncPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: Awaited<First>) => Second,
	third: (value: Awaited<Second>) => Third,
	fourth: (value: Awaited<Third>) => Fourth,
	fifth: (value: Awaited<Fourth>) => Fifth,
	sixth: (value: Awaited<Fifth>) => Sixth,
): Promise<Awaited<Sixth>>;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
async function asyncPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: Awaited<First>) => Second,
	third: (value: Awaited<Second>) => Third,
	fourth: (value: Awaited<Third>) => Fourth,
	fifth: (value: Awaited<Fourth>) => Fifth,
	sixth: (value: Awaited<Fifth>) => Sixth,
	seventh: (value: Awaited<Sixth>) => Seventh,
): Promise<Awaited<Seventh>>;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
async function asyncPipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: Awaited<First>) => Second,
	third: (value: Awaited<Second>) => Third,
	fourth: (value: Awaited<Third>) => Fourth,
	fifth: (value: Awaited<Fourth>) => Fifth,
	sixth: (value: Awaited<Fifth>) => Sixth,
	seventh: (value: Awaited<Sixth>) => Seventh,
	eighth: (value: Awaited<Seventh>) => Eighth,
): Promise<Awaited<Eighth>>;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
async function asyncPipe<
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
	first: (value: Initial) => First,
	second: (value: Awaited<First>) => Second,
	third: (value: Awaited<Second>) => Third,
	fourth: (value: Awaited<Third>) => Fourth,
	fifth: (value: Awaited<Fourth>) => Fifth,
	sixth: (value: Awaited<Fifth>) => Sixth,
	seventh: (value: Awaited<Sixth>) => Seventh,
	eighth: (value: Awaited<Seventh>) => Eighth,
	ninth: (value: Awaited<Eighth>) => Ninth,
): Promise<Awaited<Ninth>>;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
async function asyncPipe<
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
	first: (value: Initial) => First,
	second: (value: Awaited<First>) => Second,
	third: (value: Awaited<Second>) => Third,
	fourth: (value: Awaited<Third>) => Fourth,
	fifth: (value: Awaited<Fourth>) => Fifth,
	sixth: (value: Awaited<Fifth>) => Sixth,
	seventh: (value: Awaited<Sixth>) => Seventh,
	eighth: (value: Awaited<Seventh>) => Eighth,
	ninth: (value: Awaited<Eighth>) => Ninth,
	tenth: (value: Awaited<Ninth>) => Tenth,
): Promise<Awaited<Tenth>>;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
async function asyncPipe<Value>(
	value: Value,
	...pipes: Array<(value: Value) => Value>
): Promise<Value>;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
async function asyncPipe(
	value: unknown,
	...pipes: Array<(value: unknown) => unknown>
): Promise<unknown>;

async function asyncPipe(
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
 * @param value Initial value
 * @returns Piped result
 */
export function pipe<Initial, Pipe>(value: Initial, first: (value: Initial) => Pipe): Pipe;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
export function pipe<Initial, First, Second>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: First) => Second,
): Second;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
export function pipe<Initial, First, Second, Third>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: First) => Second,
	third: (value: Second) => Third,
): Third;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
export function pipe<Initial, First, Second, Third, Fourth>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: First) => Second,
	third: (value: Second) => Third,
	fourth: (value: Third) => Fourth,
): Fourth;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: First) => Second,
	third: (value: Second) => Third,
	fourth: (value: Third) => Fourth,
	fifth: (value: Fourth) => Fifth,
): Fifth;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: First) => Second,
	third: (value: Second) => Third,
	fourth: (value: Third) => Fourth,
	fifth: (value: Fourth) => Fifth,
	sixth: (value: Fifth) => Sixth,
): Sixth;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: First) => Second,
	third: (value: Second) => Third,
	fourth: (value: Third) => Fourth,
	fifth: (value: Fourth) => Fifth,
	sixth: (value: Fifth) => Sixth,
	seventh: (value: Sixth) => Seventh,
): Seventh;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: First) => Second,
	third: (value: Second) => Third,
	fourth: (value: Third) => Fourth,
	fifth: (value: Fourth) => Fifth,
	sixth: (value: Fifth) => Sixth,
	seventh: (value: Sixth) => Seventh,
	eighth: (value: Seventh) => Eighth,
): Eighth;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth, Ninth>(
	value: Initial,
	first: (value: Initial) => First,
	second: (value: First) => Second,
	third: (value: Second) => Third,
	fourth: (value: Third) => Fourth,
	fifth: (value: Fourth) => Fifth,
	sixth: (value: Fifth) => Sixth,
	seventh: (value: Sixth) => Seventh,
	eighth: (value: Seventh) => Eighth,
	ninth: (value: Eighth) => Ninth,
): Ninth;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
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
	first: (value: Initial) => First,
	second: (value: First) => Second,
	third: (value: Second) => Third,
	fourth: (value: Third) => Fourth,
	fifth: (value: Fourth) => Fifth,
	sixth: (value: Fifth) => Sixth,
	seventh: (value: Sixth) => Seventh,
	eighth: (value: Seventh) => Eighth,
	ninth: (value: Eighth) => Ninth,
	tenth: (value: Ninth) => Tenth,
): Tenth;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
export function pipe<Value>(value: Value, ...pipes: Array<(value: Value) => Value>): Value;

/**
 * Pipe a value through a series of functions
 * @param value Initial value
 * @returns Piped result
 */
export function pipe(value: unknown, ...pipes: Array<(value: unknown) => unknown>): unknown;

export function pipe(value: unknown, ...pipes: Function[]): unknown {
	assertPipeFunctions(pipes);

	return work(value, pipes, false);
}

pipe.async = asyncPipe;

// #endregion

// #endregion

// #region Work

// #region Functions

async function asyncWork(initial: unknown, functions: Function[], flow: boolean): Promise<unknown> {
	const {length} = functions;

	let transformed = initial;

	for (let index = 0; index < length; index += 1) {
		const fn = functions[index];

		transformed =
			flow && index === 0 && Array.isArray(initial)
				? await fn(...(initial as unknown[]))
				: await fn(transformed);
	}

	return transformed;
}

function work(initial: unknown, functions: Function[], flow: boolean): unknown {
	const {length} = functions;

	let transformed = initial;

	for (let index = 0; index < length; index += 1) {
		const fn = functions[index];

		transformed =
			flow && index === 0 && Array.isArray(initial)
				? fn(...(initial as unknown[]))
				: fn(transformed);
	}

	return transformed;
}

// #endregion

// #endregion

// #endregion

const MESSAGE_FLOW = 'Flow expected to receive an array of functions';

const MESSAGE_PIPE = 'Pipe expected to receive an array of functions';

const assertFlowFunctions: Asserter<Function[]> = assert.condition(
	value => Array.isArray(value) && value.every(item => typeof item === 'function'),
	MESSAGE_FLOW,
	TypeError,
);

const assertPipeFunctions: Asserter<Function[]> = assert.condition(
	value => Array.isArray(value) && value.every(item => typeof item === 'function'),
	MESSAGE_PIPE,
	TypeError,
);

// #endregion
