import {
	type AsyncPlan,
	type InternalAsyncPlan,
	type InternalPlan,
	type Plan,
	PLAN_MESSAGE_PLAN_INPUT,
	PLAN_SYMBOL,
	PLAN_TYPE_PLAN_ASYNC,
	PLAN_TYPE_PLAN_SYNC,
} from '../internal/models/plan.model';
import {isAsyncGenerator, isGenerator} from '../internal/plan';
import {asyncAttemptRun, attemptRun, attemptRunAsyncPlan, attemptRunPlan} from './result';
import {asyncRun, run, runAsyncPlan, runPlan} from './run';

// #region Instances

function AsyncPlan(this: any, generator: () => AsyncGenerator): void {
	this[PLAN_SYMBOL] = {
		generator,
		type: PLAN_TYPE_PLAN_ASYNC,
	};
}

AsyncPlan.prototype[Symbol.asyncIterator] = function (this: InternalAsyncPlan) {
	return this[PLAN_SYMBOL].generator();
};

AsyncPlan.prototype.attempt = attemptRunAsyncPlan;
AsyncPlan.prototype.run = runAsyncPlan;

function Plan(this: any, generator: () => Generator): void {
	this[PLAN_SYMBOL] = {
		generator,
		type: PLAN_TYPE_PLAN_SYNC,
	};
}

Plan.prototype[Symbol.iterator] = function (this: InternalPlan) {
	return this[PLAN_SYMBOL].generator();
};

Plan.prototype.attempt = attemptRunPlan;
Plan.prototype.run = runPlan;

// #endregion

// #region Functions

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

export function plan<Y, R, N>(
	generator: () => AsyncGenerator<Y, R, N> | Generator<Y, R, N>,
): AsyncPlan<Y, R, never> | Plan<Y, R, never> {
	if (isAsyncGenerator(generator)) {
		// @ts-expect-error All good, no worries :-)
		return new AsyncPlan(generator);
	}

	if (isGenerator(generator)) {
		// @ts-expect-error All good, no worries :-)
		return new Plan(generator);
	}

	throw new Error(PLAN_MESSAGE_PLAN_INPUT);
}

// #endregion

// #region Exports

export {asyncAttemptRun, asyncRun, attemptRun, run};

// #endregion
