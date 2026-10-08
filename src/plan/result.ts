import {asyncAttempt, attempt} from '../internal/result/attempt';
import {
	type AsyncPlan,
	type AsyncPlanState,
	type InternalAsyncPlan,
	type InternalPlan,
	PLAN_MESSAGE_RUN_INPUT,
	PLAN_SYMBOL,
	type Plan,
	type PlanError,
	type PlanOk,
	type PlanState,
} from '../models/plan.model';
import type {Result} from '../models/result.model';
import {asyncGenerate, generate} from './generate';
import {isAsyncGenerator, isAsyncPlan, isGenerator, isPlan} from './is';

// #region Functions

/**
 * Attempt to run the generator to completion
 *
 * _Returns a promised {@link Result} instead of a raw value or throwing an error_
 *
 * @returns Promised result
 */
export async function asyncAttemptRun<Yielded, Returned, Parameters extends unknown[]>(
	generator: (...parameters: Parameters) => AsyncGenerator<Yielded, Returned>,
	parameters: Parameters,
	signal?: AbortSignal,
): Promise<Result<PlanOk<Returned>, PlanError<Yielded, Returned>>>;

/**
 * Attempt to run the generator to completion
 *
 * _Returns a promised {@link Result} instead of a raw value or throwing an error_
 *
 * @returns Promised result
 */
export async function asyncAttemptRun<Yielded, Returned>(
	generator: () => AsyncGenerator<Yielded, Returned>,
	signal?: AbortSignal,
): Promise<Result<PlanOk<Returned>, PlanError<Yielded, Returned>>>;

/**
 * Attempt to run the plan to completion
 *
 * _Returns a promised {@link Result} instead of a raw value or throwing an error_
 *
 * @returns Promised result
 */
export async function asyncAttemptRun<Yielded, Returned, Parameters extends unknown[]>(
	plan: AsyncPlan<Yielded, Returned, Parameters>,
	parameters: Parameters,
	signal?: AbortSignal,
): Promise<Result<PlanOk<Returned>, PlanError<Yielded, Returned>>>;

/**
 * Attempt to run the plan to completion
 *
 * _Returns a promised {@link Result} instead of a raw value or throwing an error_
 *
 * @returns Promised result
 */
export async function asyncAttemptRun<Yielded, Returned>(
	plan: AsyncPlan<Yielded, Returned, []>,
	signal?: AbortSignal,
): Promise<Result<PlanOk<Returned>, PlanError<Yielded, Returned>>>;

export function asyncAttemptRun(input: unknown, first?: unknown, second?: unknown): unknown {
	let generator: (() => AsyncGenerator) | AsyncPlanState | undefined;

	if (isAsyncPlan(input)) {
		generator = (input as InternalAsyncPlan)[PLAN_SYMBOL];
	} else if (isAsyncGenerator(input)) {
		generator = input;
	}

	if (generator == null) {
		throw new Error(PLAN_MESSAGE_RUN_INPUT);
	}

	return asyncAttempt(() => asyncGenerate(generator, true, first, second));
}

/**
 * Attempt to run the generator to completion
 *
 * _Returns a {@link Result} instead of a raw value or throwing an error_
 *
 * @returns Result
 */
export function attemptRun<Yielded, Returned, Parameters extends unknown[]>(
	generator: (...parameters: Parameters) => Generator<Yielded, Returned>,
	...parameters: Parameters
): Result<PlanOk<Returned>, PlanError<Yielded, Returned>>;

/**
 * Attempt to run the plan to completion
 *
 * _Returns a {@link Result} instead of a raw value or throwing an error_
 *
 * @returns Result
 */
export function attemptRun<Yielded, Returned, Parameters extends unknown[]>(
	plan: Plan<Yielded, Returned, Parameters>,
	...parameters: Parameters
): Result<PlanOk<Returned>, PlanError<Yielded, Returned>>;

export function attemptRun(input: unknown, ...parameters: unknown[]): unknown {
	let generator: (() => Generator) | PlanState | undefined;

	if (isPlan(input)) {
		generator = (input as InternalPlan)[PLAN_SYMBOL];
	} else if (isGenerator(input)) {
		generator = input;
	}

	if (generator == null) {
		throw new Error(PLAN_MESSAGE_RUN_INPUT);
	}

	return attempt(() => generate(generator, parameters, true));
}

export function attemptRunAsyncPlan(this: never, first: never, second: never): Promise<unknown> {
	return asyncAttemptRun(this, first, second);
}

export function attemptRunPlan(this: InternalPlan, ...parameters: unknown[]): unknown {
	return attempt(() => generate(this[PLAN_SYMBOL], parameters, true));
}

// #endregion

// #region Namespace

export declare namespace attemptRun {
	export var async: typeof asyncAttemptRun;
}

// #endregion

// #region Initialization

attemptRun.async = asyncAttemptRun;

// #endregion
