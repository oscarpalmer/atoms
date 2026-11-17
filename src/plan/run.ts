import {asyncGenerate, generate} from '../internal/plan/plan.generate';
import {
	PLAN_MESSAGE_RUN_INPUT,
	PLAN_SYMBOL,
	type AsyncPlan,
	type InternalAsyncPlan,
	type InternalPlan,
	type Plan,
	type PlannedReturned,
} from '../models/plan.model';
import {isAsyncGeneratorFunction, isAsyncPlan, isGeneratorFunction, isPlan} from './is';
import {attemptRun} from './result';

// #region Functions

/**
 * Run an asynchronous generator to completion
 *
 * @param generator Generator to run
 * @param parameters Parameters for starting the run
 * @param signal Optional abort signal
 * @returns Promised result
 */
export async function run<Yielded, Returned, Parameters extends unknown[]>(
	generator: (...parameters: Parameters) => AsyncGenerator<Yielded, Returned>,
	parameters: Parameters,
	signal?: AbortSignal,
): Promise<PlannedReturned<Returned>>;

/**
 * Run an asynchronous plan to completion
 *
 * @param plan Plan to run
 * @param parameters Parameters for starting the run
 * @param signal Optional abort signal
 * @returns Promised result
 */
export async function run<Yielded, Returned, Parameters extends unknown[]>(
	plan: AsyncPlan<Yielded, Returned, Parameters>,
	parameters: Parameters,
	signal?: AbortSignal,
): Promise<PlannedReturned<Returned>>;

/**
 * Run an asynchronous generator to completion
 *
 * @param generator Generator to run
 * @param signal Optional abort signal
 * @returns Promised result
 */
export async function run<Yielded, Returned>(
	generator: () => AsyncGenerator<Yielded, Returned>,
	signal?: AbortSignal,
): Promise<PlannedReturned<Returned>>;

/**
 * Run an asynchronous plan to completion
 *
 * @param plan Plan to run
 * @param signal Optional abort signal
 * @returns Promised result
 */
export async function run<Yielded, Returned>(
	plan: AsyncPlan<Yielded, Returned, []>,
	signal?: AbortSignal,
): Promise<PlannedReturned<Returned>>;

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
): PlannedReturned<Returned>;

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
): PlannedReturned<Returned>;

export function run(input: unknown, ...parameters: unknown[]): unknown {
	if (isAsyncPlan(input)) {
		return asyncGenerate(
			(input as InternalAsyncPlan)[PLAN_SYMBOL],
			false,
			parameters[0],
			parameters[1],
		);
	}

	if (isAsyncGeneratorFunction(input)) {
		return asyncGenerate(input, false, parameters[0], parameters[1]);
	}

	if (isPlan(input)) {
		return generate((input as InternalPlan)[PLAN_SYMBOL], parameters, false);
	}

	if (isGeneratorFunction(input)) {
		return generate(input, parameters, false);
	}

	throw new Error(PLAN_MESSAGE_RUN_INPUT);
}

// #endregion

// #region Namespace

export declare namespace run {
	export var attempt: typeof attemptRun;
}

// #endregion

// #region Initialization

run.attempt = attemptRun;

// #endregion
