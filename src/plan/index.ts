import {attemptRunPlan, getGenerator, runAsyncPlan, runPlan} from '../internal/plan';
import {
	type AsyncPlan,
	type InternalAsyncPlan,
	type InternalPlan,
	type Plan,
	PLAN_MESSAGE_PLAN_INPUT,
	PLAN_SYMBOL,
	PLAN_TYPE_ASYNC,
	PLAN_TYPE_SYNC,
} from '../models/plan.model';
import {isAsyncGeneratorFunction, isGeneratorFunction} from './is';
import {asyncAttemptRun, attemptRun} from './result';
import {asyncRun, run} from './run';

// #region Instances

function AsyncPlan(this: InternalAsyncPlan, generator: () => AsyncGenerator): void {
	this[PLAN_SYMBOL] = {
		generator,
		type: PLAN_TYPE_ASYNC,
	};
}

AsyncPlan.prototype[Symbol.asyncIterator] = getGenerator;

AsyncPlan.prototype.attempt = attemptRunAsyncPlan;
AsyncPlan.prototype.run = runAsyncPlan;

function Plan(this: InternalPlan, generator: () => Generator): void {
	this[PLAN_SYMBOL] = {
		generator,
		type: PLAN_TYPE_SYNC,
	};
}

Plan.prototype[Symbol.iterator] = getGenerator;

Plan.prototype.attempt = attemptRunPlan;
Plan.prototype.run = runPlan;

// #endregion

// #region Functions

function attemptRunAsyncPlan(
	this: InternalAsyncPlan,
	first: never,
	second: never,
): Promise<unknown> {
	return asyncAttemptRun(this, first, second);
}

/**
 * Create a plan for an asynchronous generator function
 *
 * @param generator Generator to plan for
 * @returns Generator plan
 */
export function plan<Yielded, Returned, Parameters extends unknown[]>(
	generator: (...parameters: Parameters) => AsyncGenerator<Yielded, Returned>,
): AsyncPlan<Yielded, Returned, Parameters>;

/**
 * Create a plan for a generator function
 *
 * @param generator Generator to plan for
 * @returns Generator plan
 */
export function plan<Yielded, Returned, Parameters extends unknown[]>(
	generator: (...parameters: Parameters) => Generator<Yielded, Returned>,
): Plan<Yielded, Returned, Parameters>;

export function plan<Y, R>(
	generator: () => AsyncGenerator<Y, R> | Generator<Y, R>,
): AsyncPlan<Y, R, never> | Plan<Y, R, never> {
	if (isAsyncGeneratorFunction(generator)) {
		// @ts-expect-error All good, no worries :-)
		return new AsyncPlan(generator);
	}

	if (isGeneratorFunction(generator)) {
		// @ts-expect-error All good, no worries :-)
		return new Plan(generator);
	}

	throw new Error(PLAN_MESSAGE_PLAN_INPUT);
}

// #endregion

// #region Exports

export {asyncAttemptRun, asyncRun, attemptRun, run};

// #endregion
