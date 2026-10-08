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
	attempt: Parameters extends [infer _, ...(infer _)[]]
		? (
				parameters: Parameters,
				signal?: AbortSignal,
			) => Promise<Result<PlanOk<Returned>, PlanError<Yielded, Returned>>>
		: (signal?: AbortSignal) => Promise<Result<PlanOk<Returned>, PlanError<Yielded, Returned>>>;
	/**
	 * Run the plan to completion
	 *
	 * @throws {PlanError<Yielded, Returned>}
	 * @returns Result
	 */
	run: Parameters extends [infer _, ...(infer _)[]]
		? (parameters: Parameters, signal?: AbortSignal) => Promise<PlanReturned<Returned>>
		: (signal?: AbortSignal) => Promise<PlanReturned<Returned>>;
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

export type InternalPlanHelper = {
	[PLAN_SYMBOL]: PlanHelperState;
};

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

/**
 * An immediately failing plan
 */
export type PlanFailure<E> = {
	/**
	 * Get the generator for the failed plan
	 *
	 * @returns Generator
	 */
	[Symbol.iterator]: () => Generator<Err<E>, never>;
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
	: PlanErrorValues<Yielded> | PlanErrorValues<Returned>;

type PlanErrorValues<Original> = Original extends Error
	? Original
	: Original extends Err<infer E>
		? E
		: Original extends PlanFailure<infer E>
			? E
			: never;

type PlanHelperState = {
	generator: () => Generator;
};

export type PlanReturned<Returned> = Returned extends Error
	? never
	: Returned extends Err<infer _>
		? never
		: Returned;

/**
 * An immediately successful or failing plan
 */
export type PlanResult<Success, Failure> = PlanSuccess<Success> | PlanFailure<Failure>;

export type PlanState = {
	generator(...parameters: unknown[]): Generator;
} & BaseState<typeof PLAN_TYPE_PLAN_SYNC>;

/**
 * An immediately successful plan
 */
export type PlanSuccess<Value> = {
	/**
	 * Get the generator for the successful plan
	 *
	 * @returns Generator
	 */
	[Symbol.iterator]: () => Generator<never, Value>;
};

export type PlanType = 'asyncPlan' | 'plan';

// #endregion

// #region Variables

export const GENERATOR_NAME_ASYNC = 'AsyncGeneratorFunction';

export const GENERATOR_NAME_SYNC = 'GeneratorFunction';

export const PLAN_MESSAGE_PLAN_INPUT = 'plan requires a generator function';

export const PLAN_MESSAGE_RUN_INPUT = 'run requires a plan or a generator function';

export const PLAN_SYMBOL: unique symbol = Symbol('plan');

export const PLAN_TYPE_PLAN_ASYNC: PlanType = 'asyncPlan';

export const PLAN_TYPE_PLAN_SYNC: PlanType = 'plan';

// #endregion
