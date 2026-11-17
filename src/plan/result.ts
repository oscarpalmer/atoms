import {asyncGenerate, generate} from '../internal/plan/plan.generate';
import {attempt} from '../internal/result/attempt';
import {
	PLAN_MESSAGE_RUN_INPUT,
	PLAN_SYMBOL,
	type AsyncPlan,
	type AsyncPlanState,
	type InternalAsyncPlan,
	type InternalPlan,
	type Plan,
	type PlannedError,
	type PlannedOk,
	type PlanState,
} from '../models/plan.model';
import type {Result} from '../models/result.model';
import {isAsyncGeneratorFunction, isAsyncPlan, isGeneratorFunction, isPlan} from './is';

// #region Functions

/**
 * Attempt to run the generator to completion
 *
 * _Returns a promised {@link Result} instead of a raw value or throwing an error_
 *
 * @param generator Generator to run
 * @param parameters Parameters for starting the run
 * @param signal Optional abort signal
 * @returns Promised result
 */
export async function attemptRun<Yielded, Returned, Parameters extends unknown[]>(
	generator: (...parameters: Parameters) => AsyncGenerator<Yielded, Returned>,
	parameters: Parameters,
	signal?: AbortSignal,
): Promise<Result<PlannedOk<Returned>, PlannedError<Yielded, Returned>>>;

/**
 * Attempt to run the generator to completion
 *
 * _Returns a promised {@link Result} instead of a raw value or throwing an error_
 *
 * @param generator Generator to run
 * @param signal Optional abort signal
 * @returns Promised result
 */
export async function attemptRun<Yielded, Returned>(
	generator: () => AsyncGenerator<Yielded, Returned>,
	signal?: AbortSignal,
): Promise<Result<PlannedOk<Returned>, PlannedError<Yielded, Returned>>>;

/**
 * Attempt to run the plan to completion
 *
 * _Returns a promised {@link Result} instead of a raw value or throwing an error_
 *
 * @param plan Plan to run
 * @param parameters Parameters for starting the run
 * @param signal Optional abort signal
 * @returns Promised result
 */
export async function attemptRun<Yielded, Returned, Parameters extends unknown[]>(
	plan: AsyncPlan<Yielded, Returned, Parameters>,
	parameters: Parameters,
	signal?: AbortSignal,
): Promise<Result<PlannedOk<Returned>, PlannedError<Yielded, Returned>>>;

/**
 * Attempt to run the plan to completion
 *
 * _Returns a promised {@link Result} instead of a raw value or throwing an error_
 *
 * @param plan Plan to run
 * @param signal Optional abort signal
 * @returns Promised result
 */
export async function attemptRun<Yielded, Returned>(
	plan: AsyncPlan<Yielded, Returned, []>,
	signal?: AbortSignal,
): Promise<Result<PlannedOk<Returned>, PlannedError<Yielded, Returned>>>;

/**
 * Attempt to run the generator to completion
 *
 * _Returns a {@link Result} instead of a raw value or throwing an error_
 *
 * @param generator Generator to run
 * @param parameters Parameters for starting the run
 * @returns Result
 */
export function attemptRun<Yielded, Returned, Parameters extends unknown[]>(
	generator: (...parameters: Parameters) => Generator<Yielded, Returned>,
	...parameters: Parameters
): Result<PlannedOk<Returned>, PlannedError<Yielded, Returned>>;

/**
 * Attempt to run the plan to completion
 *
 * _Returns a {@link Result} instead of a raw value or throwing an error_
 *
 * @param plan Plan to run
 * @param parameters Parameters for starting the run
 * @returns Result
 */
export function attemptRun<Yielded, Returned, Parameters extends unknown[]>(
	plan: Plan<Yielded, Returned, Parameters>,
	...parameters: Parameters
): Result<PlannedOk<Returned>, PlannedError<Yielded, Returned>>;

export function attemptRun(input: unknown, ...parameters: unknown[]): unknown {
	const asynchronous = isAsyncGeneratorFunction(input) || isAsyncPlan(input);

	let generator:
		| (() => AsyncGenerator)
		| (() => Generator)
		| AsyncPlanState
		| PlanState
		| undefined;

	if (asynchronous) {
		generator = isAsyncGeneratorFunction(input) ? input : (input as InternalAsyncPlan)[PLAN_SYMBOL];
	} else if (isPlan(input)) {
		generator = (input as InternalPlan)[PLAN_SYMBOL];
	} else if (isGeneratorFunction(input)) {
		generator = input;
	}

	if (generator == null) {
		throw new Error(PLAN_MESSAGE_RUN_INPUT);
	}

	return attempt(() =>
		asynchronous
			? asyncGenerate(generator as never, true, ...parameters)
			: generate(generator as never, parameters, true),
	);
}

// #endregion
