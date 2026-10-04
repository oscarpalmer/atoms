import {
	type AsyncPlan,
	type InternalAsyncPlan,
	type InternalPlan,
	type Plan,
	PLAN_MESSAGE_PLAN_INPUT,
	PLAN_MESSAGE_RUN_INPUT,
	PLAN_SYMBOL,
	PLAN_TYPE_PLAN_ASYNC,
	PLAN_TYPE_PLAN_SYNC,
	type PlanError,
	type PlanResult,
} from '../internal/models/plan.model';
import {isAsyncGenerator, isAsyncPlan, isGenerator, isPlan} from '../internal/plan';

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

Plan.prototype.run = runPlan;

// #endregion

// #region Functions

async function asyncExecute(callback: () => AsyncGenerator): Promise<unknown> {
	const generator = callback();

	let success = true;
	let lastValue: unknown;

	try {
		while (true) {
			const next = await generator.next(lastValue);
			const {done} = next;

			let {value} = next;

			if (value instanceof Error) {
				throw value;
			}

			lastValue = value;

			if (done === true) {
				break;
			}
		}
	} catch (error) {
		lastValue = error;
		success = false;
	} finally {
		generator?.return(lastValue);
	}

	if (success) {
		return lastValue;
	}

	throw lastValue;
}

function execute(callback: () => Generator): unknown {
	const generator = callback();

	let success = true;
	let lastValue: unknown;

	try {
		while (true) {
			const next = generator.next(lastValue);
			const done = next.done === true;

			let {value} = next;

			if (value instanceof Error) {
				throw value;
			}

			lastValue = value;

			if (done) {
				break;
			}
		}
	} catch (error) {
		lastValue = error;
		success = false;
	} finally {
		generator.return(lastValue);
	}

	if (success) {
		return lastValue;
	}

	throw lastValue;
}

/**
 * Create a plan for an asynchronous generator function
 *
 * @param generator Generator to plan for
 * @returns Generator plan
 */
export function plan<Yielded, Returned>(
	generator: () => AsyncGenerator<Yielded, Returned>,
): AsyncPlan<Yielded, Returned>;

/**
 * Create a plan for a generator function
 *
 * @param generator Generator to plan for
 * @returns Generator plan
 */
export function plan<Yielded, Returned>(
	generator: () => Generator<Yielded, Returned>,
): Plan<Yielded, Returned>;

export function plan<Y, R, N>(
	generator: () => AsyncGenerator<Y, R, N> | Generator<Y, R, N>,
): AsyncPlan<Y, R> | Plan<Y, R> {
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

/**
 * Run an asynchronous generator to completion
 *
 * @param generator Generator to run
 * @returns Result
 */
export async function run<Yielded, Returned>(
	generator: () => AsyncGenerator<Yielded, Returned>,
): Promise<PlanResult<Returned> | PlanError<Yielded, Returned>>;

/**
 * Run an asynchronous plan to completion
 *
 * @param plan Plan to run
 * @returns Result
 */
export async function run<Yielded, Returned>(
	plan: AsyncPlan<Yielded, Returned>,
): Promise<PlanResult<Returned> | PlanError<Yielded, Returned>>;

/**
 * Run a generator to completion
 *
 * @param generator Generator to run
 * @returns Result
 */
export function run<Yielded, Returned>(
	generator: () => Generator<Yielded, Returned>,
): PlanResult<Returned> | PlanError<Yielded, Returned>;

/**
 * Run a plan to completion
 *
 * @param plan Plan to run
 * @returns Result
 */
export function run<Yielded, Returned>(
	plan: Plan<Yielded, Returned>,
): PlanResult<Returned> | PlanError<Yielded, Returned>;

export function run(input: unknown): unknown {
	if (isAsyncPlan(input) || isPlan(input)) {
		return input.run();
	}

	if (isAsyncGenerator(input)) {
		return asyncExecute(input);
	}

	if (isGenerator(input)) {
		return execute(input);
	}

	throw new Error(PLAN_MESSAGE_RUN_INPUT);
}

function runAsyncPlan(this: InternalAsyncPlan): Promise<unknown> {
	return asyncExecute(this[PLAN_SYMBOL].generator);
}

function runPlan(this: InternalPlan): unknown {
	return execute(this[PLAN_SYMBOL].generator);
}

// #endregion
