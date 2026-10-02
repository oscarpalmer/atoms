import type {Result} from './result.model';

// #region Types

/**
 * An asynchronous plan of execution that can yield intermediate results and eventually return a result
 */
export type AsyncPlan<Value, Error = unknown> = {
	/**
	 * Run the plan to completion
	 *
	 * @returns Result
	 */
	run: () => Promise<Result<Value, Error>>;
};

type AsyncPlanState = {
	generator: () => AsyncGenerator;
} & BaseState<typeof PLAN_TYPE_PLAN_ASYNC>;

type BaseState<Type extends PlanType> = {
	type: Type;
};

export type InternalAsyncPlan = {
	[PLAN_SYMBOL]: AsyncPlanState;
} & AsyncPlan<never, never>;

export type InternalPlan = {
	[PLAN_SYMBOL]: PlanState;
} & Plan<never, never>;

/**
 * A plan of execution that can yield intermediate results and eventually return a result
 */
export type Plan<Value, Error = unknown> = {
	/**
	 * Run the plan to completion
	 *
	 * @returns Result
	 */
	run: () => Result<Value, Error>;
};

type PlanState = {
	generator: () => Generator;
} & BaseState<typeof PLAN_TYPE_PLAN_SYNC>;

export type PlanType = 'asyncPlan' | 'plan';

// #endregion

// #region Variables

export const GENERATOR_NAME_ASYNC = 'AsyncGeneratorFunction';

export const GENERATOR_NAME_SYNC = 'GeneratorFunction';

export const PLAN_MESSAGE_PLAN_INPUT = 'plan requires a generator function';

export const PLAN_MESSAGE_RUN_INPUT = 'run requires a plan or a generator function';

export const PLAN_SYMBOL: symbol = Symbol('plan');

export const PLAN_TYPE_PLAN_ASYNC: PlanType = 'asyncPlan';

export const PLAN_TYPE_PLAN_SYNC: PlanType = 'plan';

// #endregion
