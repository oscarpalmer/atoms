// #region Types

/**
 * An asynchronous plan of execution that can yield intermediate results and eventually return a result
 */
export type AsyncPlan<Yielded, Returned> = {
	/**
	 * Get the asynchronous generator for the plan
	 *
	 * @returns Asynchronous generator
	 */
	[Symbol.asyncIterator]: () => AsyncGenerator<Yielded, Returned, unknown>;
	/**
	 * Run the plan to completion
	 *
	 * @throws {PlanError<Yielded, Returned>}
	 * @returns Result
	 */
	run: () => Promise<PlanResult<Returned>>;
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
export type Plan<Yielded, Returned> = {
	/**
	 * Get the generator for the plan
	 *
	 * @returns Generator
	 */
	[Symbol.iterator]: () => Generator<Yielded, Returned, unknown>;
	/**
	 * Run the plan to completion
	 *
	 * @throws {PlanError<Yielded, Returned>}
	 * @returns Result
	 */
	run: () => PlanResult<Returned>;
};

type PlanErrorValues<Original> = Original extends Error ? Original : never;

export type PlanError<Yielded, Returned> =
	| PlanErrorValues<Yielded>
	| PlanErrorValues<Returned>
	| Error;

export type PlanResult<Returned> = Returned extends Error ? never : Returned;

type PlanState = {
	generator: () => Generator;
} & BaseState<typeof PLAN_TYPE_PLAN_SYNC>;

export type PlanType = 'asyncPlan' | 'plan' | 'stop';

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
