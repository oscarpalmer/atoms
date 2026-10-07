import {
	type AsyncPlan,
	type InternalAsyncPlan,
	type InternalPlan,
	PLAN_MESSAGE_RUN_INPUT,
	PLAN_SYMBOL,
	type Plan,
	type PlanError,
	type PlanOk,
} from '../internal/models/plan.model';
import type {Result} from '../internal/models/result.model';
import {asyncAttempt, attempt} from '../internal/result/attempt';
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
	...parameters: Parameters
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
	...parameters: Parameters
): Promise<Result<PlanOk<Returned>, PlanError<Yielded, Returned>>>;

export function asyncAttemptRun(input: unknown, ...parameters: unknown[]): unknown {
	if (isAsyncPlan(input)) {
		return input.attempt(...parameters);
	}

	if (isAsyncGenerator(input)) {
		return asyncAttempt(() => asyncGenerate(input, parameters, true));
	}

	throw new Error(PLAN_MESSAGE_RUN_INPUT);
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
	if (isPlan(input)) {
		return input.attempt(...parameters);
	}

	if (isGenerator(input)) {
		return attempt(() => generate(input, parameters, true));
	}

	throw new Error(PLAN_MESSAGE_RUN_INPUT);
}

export function attemptRunAsyncPlan(
	this: InternalAsyncPlan,
	...parameters: unknown[]
): Promise<unknown> {
	return asyncAttempt(() => asyncGenerate(this[PLAN_SYMBOL].generator, parameters, true));
}

export function attemptRunPlan(this: InternalPlan, ...parameters: unknown[]): unknown {
	return attempt(() => generate(this[PLAN_SYMBOL].generator, parameters, true));
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
