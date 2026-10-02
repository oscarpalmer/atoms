// #region Types

export type InternalPlan = {
	[PLAN_SYMBOL]: PlanState;
} & Plan<never, never>;

/**
 * A plan of execution that can yield intermediate results and eventually return a value or an error.
 */
export type Plan<out Value, out Error = unknown> = {
	/**
	 * Run the plan to completion
	 *
	 * @returns Final result, or an error
	 */
	run: () => Error | Value;
};

type PlanState = {
	generator: () => Generator;
};

// #endregion

// #region Variables

export const GENERATOR_NAME = 'GeneratorFunction';

export const PLAN_MESSAGE_PLAN_INPUT = 'plan requires a generator function';

export const PLAN_MESSAGE_RUN_INPUT = 'run requires a plan or a generator function';

export const PLAN_SYMBOL: symbol = Symbol('plan');

// #endregion
