import type {Err, Ok, Result} from './result.model';

// #region Types

/**
 * An asynchronous plan of execution that can yield intermediate results and eventually return a result
 */
export type AsyncPlan<Yielded, Returned, Parameters extends unknown[]> = {
	/**
	 * Get the asynchronous generator for the plan
	 *
	 * @returns Asynchronous generator
	 */
	[Symbol.asyncIterator]: (...parameters: Parameters) => AsyncGenerator<Yielded, Returned>;
	/**
	 * Attempt to run the plan to completion
	 *
	 * _Returns a promised {@link Result} instead of a raw value or throwing an error_
	 *
	 * @returns Attempted result
	 */
	attempt(
		...parameters: Parameters
	): Promise<Result<PlanOk<Returned>, PlanError<Yielded, Returned>>>;
	/**
	 * Run the plan to completion
	 *
	 * @throws {PlanError<Yielded, Returned>}
	 * @returns Result
	 */
	run(...parameters: Parameters): Promise<PlanReturned<Returned>>;
};

export type AsyncPlanState = {
	generator(...parameters: unknown[]): AsyncGenerator;
} & BaseState<typeof PLAN_TYPE_PLAN_ASYNC>;

type BaseState<Type extends PlanType> = {
	type: Type;
};

export type InternalAsyncPlan = {
	[PLAN_SYMBOL]: AsyncPlanState;
} & AsyncPlan<never, never, unknown[]>;

export type InternalPlan = {
	[PLAN_SYMBOL]: PlanState;
} & Plan<never, never, unknown[]>;

/**
 * A plan of execution that can yield intermediate results and eventually return a result
 */
export type Plan<Yielded, Returned, Parameters extends unknown[]> = {
	/**
	 * Get the generator for the plan
	 *
	 * @returns Generator
	 */
	[Symbol.iterator]: (...parameters: Parameters) => Generator<Yielded, Returned>;
	/**
	 * Attempt to run the plan to completion
	 *
	 * _Returns a {@link Result} instead of a raw value or throwing an error_
	 *
	 * @returns Attempted result
	 */
	attempt(...parameters: Parameters): Result<PlanOk<Returned>, PlanError<Yielded, Returned>>;
	/**
	 * Run the plan to completion
	 *
	 * @throws {PlanError<Yielded, Returned>}
	 * @returns Result
	 */
	run(...parameters: Parameters): PlanReturned<Returned>;
};

export type PlanOk<Returned> = Returned extends Error
	? never
	: Returned extends Err<infer _>
		? never
		: Returned extends Ok<infer Value>
			? Value
			: Returned;

type PlanErrors<Yielded, Returned> = PlanErrorValues<Yielded> | PlanErrorValues<Returned>;

export type PlanError<Yielded, Returned> = [PlanErrors<Yielded, Returned>] extends [never]
	? Error
	: PlanErrors<Yielded, Returned>;

type PlanErrorValues<Original> = Original extends Error
	? Original
	: Original extends Err<infer Error>
		? Error
		: never;

export type PlanReturned<Returned> = Returned extends Error
	? never
	: Returned extends Err<infer _>
		? never
		: Returned;

export type PlanState = {
	generator(...parameters: unknown[]): Generator;
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
