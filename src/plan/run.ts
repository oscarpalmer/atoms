import {
	PLAN_MESSAGE_RUN_INPUT,
	PLAN_SYMBOL,
	type AsyncPlan,
	type InternalAsyncPlan,
	type InternalPlan,
	type Plan,
	type PlanReturned,
} from '../models/plan.model';
import {asyncGenerate, generate} from './generate';
import {isAsyncGenerator, isAsyncPlan, isGenerator, isPlan} from './is';
import {asyncAttemptRun, attemptRun} from './result';

// #region Functions

/**
 * Run an asynchronous generator to completion
 *
 * @param generator Generator to run
 * @param parameters Parameters for starting the run
 * @param signal Optional abort signal
 * @returns Result
 */
export async function asyncRun<Yielded, Returned, Parameters extends unknown[]>(
	generator: (...parameters: Parameters) => AsyncGenerator<Yielded, Returned>,
	parameters: Parameters,
	signal?: AbortSignal,
): Promise<PlanReturned<Returned>>;

/**
 * Run an asynchronous generator to completion
 *
 * @param generator Generator to run
 * @param signal Optional abort signal
 * @returns Result
 */
export async function asyncRun<Yielded, Returned>(
	generator: () => AsyncGenerator<Yielded, Returned>,
	signal?: AbortSignal,
): Promise<PlanReturned<Returned>>;

/**
 * Run an asynchronous plan to completion
 *
 * @param plan Plan to run
 * @param parameters Parameters for starting the run
 * @param signal Optional abort signal
 * @returns Result
 */
export async function asyncRun<Yielded, Returned, Parameters extends unknown[]>(
	plan: AsyncPlan<Yielded, Returned, Parameters>,
	parameters: Parameters,
	signal?: AbortSignal,
): Promise<PlanReturned<Returned>>;

/**
 * Run an asynchronous plan to completion
 *
 * @param plan Plan to run
 * @param signal Optional abort signal
 * @returns Result
 */
export async function asyncRun<Yielded, Returned>(
	plan: AsyncPlan<Yielded, Returned, []>,
	signal?: AbortSignal,
): Promise<PlanReturned<Returned>>;

export function asyncRun(input: unknown, first?: unknown, second?: unknown): unknown {
	if (isAsyncPlan(input)) {
		return asyncGenerate((input as InternalAsyncPlan)[PLAN_SYMBOL], false, first, second);
	}

	if (isAsyncGenerator(input)) {
		return asyncGenerate(input, false, first, second);
	}

	throw new Error(PLAN_MESSAGE_RUN_INPUT);
}

/**
 * Run a generator to completion
 *
 * @param generator Generator to run
 * @param parameters Parameters for starting the run
 * @returns Result
 */
export function run<Yielded, Returned, Parameters extends unknown[]>(
	generator: (...parameters: Parameters) => Generator<Yielded, Returned>,
	...parameters: Parameters
): PlanReturned<Returned>;

/**
 * Run a plan to completion
 *
 * @param plan Plan to run
 * @param parameters Parameters for starting the run
 * @returns Result
 */
export function run<Yielded, Returned, Parameters extends unknown[]>(
	plan: Plan<Yielded, Returned, Parameters>,
	...parameters: Parameters
): PlanReturned<Returned>;

export function run(input: unknown, ...parameters: unknown[]): unknown {
	if (isPlan(input)) {
		return input.run(...parameters);
	}

	if (isGenerator(input)) {
		return generate(input, parameters, false);
	}

	throw new Error(PLAN_MESSAGE_RUN_INPUT);
}

export function runAsyncPlan(
	this: InternalAsyncPlan,
	first: never,
	second: never,
): Promise<unknown> {
	return asyncGenerate(this[PLAN_SYMBOL], false, first, second);
}

export function runPlan(this: InternalPlan, ...parameters: unknown[]): unknown {
	return generate(this[PLAN_SYMBOL], parameters, false);
}

// #endregion

// #region Namespace

export declare namespace asyncRun {
	export var attempt: typeof asyncAttemptRun;
}

export declare namespace run {
	export var async: typeof asyncRun;
	export var attempt: typeof attemptRun;
}

// #endregion

// #region Initialization

asyncRun.attempt = asyncAttemptRun;

run.async = asyncRun;
run.attempt = attemptRun;

// #endregion
