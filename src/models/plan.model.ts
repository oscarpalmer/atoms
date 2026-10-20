import type {Err, Ok, Result} from './result.model';

// #region Types

/**
 * An immediately failing asynchronous plan
 */
export type AsyncFailure<Value> = {
	/**
	 * Get the generator for the failed plan
	 *
	 * @returns Generator
	 */
	[Symbol.asyncIterator]: () => AsyncGenerator<Err<Value>, never>;
};

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

/**
 * An immediately succeeding or failing asynchronous plan
 */
export type AsyncPlanned<Value, Error> = AsyncSuccess<Value> | AsyncFailure<Error>;

export type AsyncPlannedState = {
	generator: () => AsyncGenerator;
	type: typeof PLAN_FAILURE_ASYNC | typeof PLAN_SUCCESS_ASYNC;
};

export type AsyncPlanState = {
	generator(...parameters: unknown[]): AsyncGenerator;
	type: typeof PLAN_TYPE_ASYNC;
};

/**
 * A single asynchronous step within a plan of execution
 */
export type AsyncStep<Input> = {
	/**
	 * Get the asynchronous generator for the step
	 *
	 * @returns Asynchronous generator
	 */
	[Symbol.asyncIterator]: () => AsyncGenerator<AsyncStepYielded<Input>, AsyncStepReturned<Input>>;
};

type AsyncStepReturned<Input> = AsyncStepReturnedItem<Awaited<Input>>;

type AsyncStepReturnedItem<Input> = Input extends {
	[Symbol.asyncIterator](): AsyncGenerator<infer _, infer Returned>;
}
	? Returned
	: StepReturned<Input>;

export type AsyncStepState = {
	generator: () => AsyncGenerator;
	type: typeof PLAN_STEP_ASYNC;
};

export type AsyncStepValue<Input> = [
	Extract<Awaited<Input>, InvalidAsyncStepValue<Awaited<Input>>>,
] extends [never]
	? unknown
	: never;

type AsyncStepYielded<Input> = AsyncStepYieldedItem<Awaited<Input>>;

type AsyncStepYieldedItem<Input> = Input extends {
	[Symbol.asyncIterator](): AsyncGenerator<infer Yielded>;
}
	? Yielded
	: StepYielded<Input>;

/**
 * An immediately successful asynchronous plan
 */
export type AsyncSuccess<Value> = {
	/**
	 * Get the generator for the successful plan
	 *
	 * @returns Generator
	 */
	[Symbol.asyncIterator]: () => AsyncGenerator<never, Value>;
};

/**
 * An immediately failing plan
 */
export type Failure<Value> = {
	/**
	 * Get the generator for the failed plan
	 *
	 * @returns Generator
	 */
	[Symbol.iterator]: () => Generator<Err<Value>, never>;
};

export type GenericPlanItem = {
	[PLAN_SYMBOL]: GenericPlanItemState;
	[Symbol.asyncIterator]: () => AsyncGenerator;
	[Symbol.iterator]: () => Generator;
};

export type GenericPlanItemState = {
	generator: () => AsyncGenerator | Generator;
	type: PlanType | PlannedType | StepType;
};

export type InternalAsyncFailure = {
	[PLAN_SYMBOL]: AsyncPlannedState;
} & AsyncFailure<never>;

export type InternalAsyncPlan = {
	[PLAN_SYMBOL]: AsyncPlanState;
} & AsyncPlan<never, never, unknown[]>;

export type InternalAsyncStep = {
	[PLAN_SYMBOL]: AsyncStepState;
} & AsyncStep<never>;

export type InternalAsyncSuccess = {
	[PLAN_SYMBOL]: AsyncPlannedState;
} & AsyncSuccess<never>;

export type InternalFailure = {
	[PLAN_SYMBOL]: PlannedState;
} & Failure<never>;

export type InternalPlan = {
	[PLAN_SYMBOL]: PlanState;
} & Plan<never, never, unknown[]>;

export type InternalSuccess = {
	[PLAN_SYMBOL]: PlannedState;
} & Success<never>;

export type InternalStep = {
	[PLAN_SYMBOL]: StepState;
} & Step<never>;

type InvalidAsyncStepValue<Input> = ((...args: any[]) => unknown) | ParameterizedPlan<Input>;

type InvalidStepValue<Input> =
	| ((...args: any[]) => unknown)
	| {[Symbol.asyncIterator]: unknown}
	| ParameterizedPlan<Input>
	| Promise<unknown>;

type ParameterizedPlan<Input> = Input extends {
	[Symbol.iterator]: (...parameters: infer Parameters) => unknown;
}
	? [] extends Parameters
		? never
		: Input
	: Input extends {[Symbol.asyncIterator]: (...parameters: infer Parameters) => unknown}
		? [] extends Parameters
			? never
			: Input
		: never;

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
 * An OK result of a plan execution
 */
export type PlanOk<Returned> = Returned extends Error
	? never
	: Returned extends Err<infer _>
		? never
		: Returned extends Ok<infer Value>
			? Value
			: Returned;

type PlanErrors<Yielded, Returned> = PlanErrorValues<Yielded> | PlanErrorValues<Returned>;

/**
 * An error result of a plan execution
 */
export type PlanError<Yielded, Returned> = [PlanErrors<Yielded, Returned>] extends [never]
	? Error
	: PlanErrorValues<Yielded> | PlanErrorValues<Returned>;

type PlanErrorValues<Original> = Original extends Error
	? Original
	: Original extends Err<infer E>
		? E
		: Original extends Failure<infer E>
			? E
			: never;

/**
 * The returned result of a plan execution _(excluding errors, which are thrown)_
 */
export type PlanReturned<Returned> = Returned extends Error
	? never
	: Returned extends Err<infer _>
		? never
		: Returned;

/**
 * An immediately succeeding or failing plan
 */
export type Planned<Value, Error> = Success<Value> | Failure<Error>;

export type PlannedState = {
	generator: () => Generator;
	type: typeof PLAN_FAILURE_SYNC | typeof PLAN_SUCCESS_SYNC;
};

export type PlannedType = 'asyncFailure' | 'asyncSuccess' | 'failure' | 'success';

export type PlanState = {
	generator(...parameters: unknown[]): Generator;
	type: typeof PLAN_TYPE_SYNC;
};

/**
 * A single step within a plan of execution
 */
export type Step<Input> = {
	/**
	 * Get the generator for the step
	 *
	 * @returns Generator
	 */
	[Symbol.iterator]: () => Generator<StepYielded<Input>, StepReturned<Input>>;
};

type StepReturned<Input> = Input extends Error
	? never
	: Input extends Err<infer _>
		? never
		: Input extends Ok<infer Value>
			? Value
			: Input extends {[Symbol.iterator](): Generator<infer _, infer Returned>}
				? Returned
				: Input;

export type StepState = {
	generator: () => Generator;
	type: typeof PLAN_STEP_SYNC;
};

export type StepType = 'asyncStep' | 'step';

export type StepValue<Input> = [Extract<Input, InvalidStepValue<Input>>] extends [never]
	? unknown
	: never;

type StepYielded<Input> = Input extends Error
	? Err<Input>
	: Input extends Err<infer _>
		? Input
		: Input extends {[Symbol.iterator](): Generator<infer Yielded>}
			? Yielded
			: never;

export type PlanType = 'asyncPlan' | 'plan';

/**
 * An immediately successful plan
 */
export type Success<Value> = {
	/**
	 * Get the generator for the successful plan
	 *
	 * @returns Generator
	 */
	[Symbol.iterator]: () => Generator<never, Value>;
};

// #endregion

// #region Variables

export const GENERATOR_FUNCTION_TYPE_ASYNC = '[object AsyncGeneratorFunction]';

export const GENERATOR_FUNCTION_TYPE_SYNC = '[object GeneratorFunction]';

export const GENERATOR_TYPE_ASYNC = '[object AsyncGenerator]';

export const GENERATOR_TYPE_SYNC = '[object Generator]';

export const PLAN_FAILURE_ASYNC = 'asyncFailure' as const;

export const PLAN_FAILURE_SYNC = 'failure' as const;

export const PLAN_MESSAGE_PLAN_INPUT = 'plan requires a generator function';

export const PLAN_MESSAGE_RUN_INPUT = 'run requires a plan or a generator function';

export const PLAN_MESSAGE_USE_NESTED_FN = "Cannot use nested functions with 'use'";

export const PLAN_MESSAGE_USE_SYNC_ASYNC = "Cannot use asynchronous values with 'use'";

export const PLAN_STEP_ASYNC = 'asyncStep' as const;

export const PLAN_STEP_SYNC = 'step' as const;

export const PLAN_SUCCESS_ASYNC = 'asyncSuccess' as const;

export const PLAN_SUCCESS_SYNC = 'success' as const;

export const PLAN_SYMBOL: unique symbol = Symbol('plan');

export const PLAN_TYPE_ASYNC = 'asyncPlan' as const;

export const PLAN_TYPE_SYNC = 'plan' as const;

// #endregion
