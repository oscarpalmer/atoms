import {
	type AsyncPlan,
	type InternalPlan,
	PLAN_MESSAGE_RUN_INPUT,
	type Plan,
	type PlanError,
	type PlanResult,
} from '../internal/models/plan.model';
import type {Result} from '../internal/models/result.model';
import {isAsyncGenerator, isAsyncPlan, isGenerator, isPlan} from '../internal/plan';
import {asyncAttempt, attempt} from '../internal/result/attempt';
import {asyncGenerate, generate} from './generate';

// #region Functions

/**
 * Attempt to run the generator to completion
 *
 * _Returns a promised {@link Result} instead of a raw value or throwing an error_
 *
 * @returns Promised result
 */
export async function asyncAttemptRun<Yielded, Returned, Parameters extends unknown[]>(
	generator: (...parameters: Parameters) => AsyncGenerator<Yielded, Returned, unknown>,
	...parameters: Parameters
): Promise<Result<PlanResult<Returned>, PlanError<Yielded, Returned>>>;

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
): Promise<Result<PlanResult<Returned>, PlanError<Yielded, Returned>>>;

export function asyncAttemptRun(input: unknown, ...parameters: unknown[]): unknown {
	if (isAsyncPlan(input)) {
		return input.attempt(...parameters);
	}

	if (isAsyncGenerator(input)) {
		return asyncAttempt(() => asyncGenerate(input, parameters));
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
export function attemptRun<Yielded, Returned>(
	generator: () => Generator<Yielded, Returned, unknown>,
	...parameters: Parameters<typeof generator>
): Result<PlanResult<Returned>, PlanError<Yielded, Returned>>;

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
): Result<PlanResult<Returned>, PlanError<Yielded, Returned>>;

export function attemptRun(input: unknown, ...parameters: unknown[]): unknown {
	if (isPlan(input)) {
		return input.attempt(...parameters);
	}

	if (isGenerator(input)) {
		return attempt(() => generate(input, parameters));
	}

	throw new Error(PLAN_MESSAGE_RUN_INPUT);
}

export function attemptRunAsyncPlan(
	this: InternalPlan,
	...parameters: unknown[]
): Promise<unknown> {
	return asyncAttempt(() => this.run(...parameters));
}

export function attemptRunPlan(this: InternalPlan, ...parameters: unknown[]): unknown {
	return attempt(() => this.run(...parameters));
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
