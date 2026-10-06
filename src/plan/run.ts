import {
	PLAN_MESSAGE_RUN_INPUT,
	PLAN_SYMBOL,
	type AsyncPlan,
	type InternalAsyncPlan,
	type InternalPlan,
	type Plan,
	type PlanError,
	type PlanResult,
} from '../internal/models/plan.model';
import {isAsyncGenerator, isAsyncPlan, isGenerator, isPlan} from '../internal/plan';
import {asyncGenerate, generate} from './generate';
import {asyncAttemptRun, attemptRun} from './result';

// #region Functions

/**
 * Run an asynchronous generator to completion
 *
 * @param generator Generator to run
 * @returns Result
 */
export async function asyncRun<Yielded, Returned, Parameters extends unknown[]>(
	generator: (...parameters: Parameters) => AsyncGenerator<Yielded, Returned, unknown>,
	...parameters: Parameters
): Promise<PlanResult<Returned>>;

/**
 * Run an asynchronous plan to completion
 *
 * @param plan Plan to run
 * @returns Result
 */
export async function asyncRun<Yielded, Returned, Parameters extends unknown[]>(
	plan: AsyncPlan<Yielded, Returned, Parameters>,
	...parameters: Parameters
): Promise<PlanResult<Returned>>;

export function asyncRun(input: unknown, ...parameters: unknown[]): unknown {
	if (isAsyncPlan(input)) {
		return input.run(...parameters);
	}

	if (isAsyncGenerator(input)) {
		return asyncGenerate(input, parameters);
	}

	throw new Error(PLAN_MESSAGE_RUN_INPUT);
}

/**
 * Run a generator to completion
 *
 * @param generator Generator to run
 * @returns Result
 */
export function run<Yielded, Returned, Parameters extends unknown[]>(
	generator: (...parameters: Parameters) => Generator<Yielded, Returned, unknown>,
	...parameters: Parameters
): PlanResult<Returned> | PlanError<Yielded, Returned>;

/**
 * Run a plan to completion
 *
 * @param plan Plan to run
 * @returns Result
 */
export function run<Yielded, Returned, Parameters extends unknown[]>(
	plan: Plan<Yielded, Returned, Parameters>,
	...parameters: Parameters
): PlanResult<Returned> | PlanError<Yielded, Returned>;

export function run(input: unknown, ...parameters: unknown[]): unknown {
	if (isPlan(input)) {
		return input.run(...parameters);
	}

	if (isGenerator(input)) {
		return generate(input, parameters);
	}

	throw new Error(PLAN_MESSAGE_RUN_INPUT);
}

export function runAsyncPlan(this: InternalAsyncPlan, ...parameters: unknown[]): Promise<unknown> {
	return asyncGenerate(this[PLAN_SYMBOL].generator, parameters);
}

export function runPlan(this: InternalPlan, ...parameters: unknown[]): unknown {
	return generate(this[PLAN_SYMBOL].generator, parameters);
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
