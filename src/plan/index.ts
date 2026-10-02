import {
	type AsyncPlan,
	type InternalAsyncPlan,
	type InternalPlan,
	type Plan,
	type PlanType,
	GENERATOR_NAME_ASYNC,
	GENERATOR_NAME_SYNC,
	PLAN_MESSAGE_PLAN_INPUT,
	PLAN_MESSAGE_RUN_INPUT,
	PLAN_SYMBOL,
	PLAN_TYPE_PLAN_ASYNC,
	PLAN_TYPE_PLAN_SYNC,
} from '../internal/models/plan.model';
import type {Result} from '../internal/models/result.model';
import {asyncAttempt, attempt} from '../internal/result/attempt';
import type {PlainObject} from '../models';
import {isError, isOk} from '../result/misc';

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

function asyncExecute(callback: () => AsyncGenerator): Promise<unknown> {
	return asyncAttempt(async () => {
		const generator = callback();

		let lastValue: unknown;

		while (true) {
			const next = await generator.next();
			const {done} = next;

			let value = next.value;

			if (value instanceof Error) {
				throw value;
			}

			if (isError(value)) {
				throw value.error;
			}

			if (isOk(value)) {
				value = value.value;
			}

			lastValue = value;

			if (done === true) {
				break;
			}
		}

		return lastValue;
	});
}

/**
 * Create a plan for an asynchronous generator function
 *
 * @param generator Generator to plan for
 * @returns Generator plan
 */
export function asyncPlan<Value = unknown, Error = unknown>(
	generator: () => AsyncGenerator<unknown, Value, unknown>,
): AsyncPlan<Value, Error> {
	if (!isAsyncGenerator(generator)) {
		throw new Error(PLAN_MESSAGE_PLAN_INPUT);
	}

	// @ts-expect-error All good, no worries :-)
	return new AsyncPlan(generator) as AsyncPlan<Value, Error>;
}

/**
 * Run an asynchronous generator to completion
 *
 * @param generator Generator to run
 * @returns Result
 */
export async function asyncRun<Value = unknown, Error = unknown>(
	generator: () => AsyncGenerator<unknown, Value, unknown>,
): Promise<Result<Value, Error>>;

/**
 * Run an asynchronous plan to completion
 *
 * @param plan Plan to run
 * @returns Result
 */
export async function asyncRun<Value = unknown, Error = unknown>(
	plan: AsyncPlan<Value, Error>,
): Promise<Result<Value, Error>>;

export async function asyncRun(input: unknown): Promise<unknown> {
	if (isAsyncPlan(input)) {
		return input.run();
	}

	if (!isAsyncGenerator(input)) {
		throw new Error(PLAN_MESSAGE_RUN_INPUT);
	}

	return asyncExecute(input);
}

function execute(callback: () => Generator): Result<unknown, unknown> {
	return attempt(() => {
		const generator = callback();

		let lastValue: unknown;

		while (true) {
			const next = generator.next();
			const {done} = next;

			let {value} = next;

			if (value instanceof Error) {
				throw value;
			}

			if (isError(value)) {
				throw value.error;
			}

			if (isOk(value)) {
				value = value.value;
			}

			lastValue = value;

			if (done === true) {
				break;
			}
		}

		return lastValue;
	});
}

/**
 * Is the value an asynchronous plan?
 *
 * @param value Value to check
 * @returns `true` if the value is an asynchronous plan, otherwise `false`
 */
export function isAsyncPlan<Value = unknown, Error = unknown>(
	value: unknown,
): value is AsyncPlan<Value, Error> {
	return isPlanInstance(PLAN_TYPE_PLAN_ASYNC, value);
}

/**
 * Is the value an asynchronous generator function?
 *
 * @param value Value to check
 * @returns `true` if the value is an asynchronous generator function, otherwise `false`
 */
export function isAsyncGenerator(value: unknown): value is () => AsyncGenerator {
	return isGeneratorInstance(GENERATOR_NAME_ASYNC, value);
}

/**
 * Is the value a generator function?
 *
 * @param value Value to check
 * @returns `true` if the value is a generator function, otherwise `false`
 */
export function isGenerator(value: unknown): value is () => Generator {
	return isGeneratorInstance(GENERATOR_NAME_SYNC, value);
}

function isGeneratorInstance(name: string, value: unknown): boolean {
	return (
		typeof value === 'function' &&
		value !== null &&
		value.constructor.name === name &&
		typeof value.prototype.next === 'function' &&
		typeof value.prototype.return === 'function' &&
		typeof value.prototype.throw === 'function'
	);
}

/**
 * Is the value a plan?
 *
 * @param value Value to check
 * @returns `true` if the value is a plan, otherwise `false`
 */
export function isPlan<Value = unknown, Error = unknown>(
	value: unknown,
): value is Plan<Value, Error> {
	return isPlanInstance(PLAN_TYPE_PLAN_SYNC, value);
}

function isPlanInstance(type: PlanType, value: unknown): boolean {
	return (
		typeof value === 'object' &&
		value !== null &&
		PLAN_SYMBOL in value &&
		((value as PlainObject)[PLAN_SYMBOL] as PlainObject).type === type
	);
}

/**
 * Create a plan for a generator function
 *
 * @param generator Generator to plan for
 * @returns Generator plan
 */
export function plan<Value = unknown, Error = unknown>(
	generator: () => Generator<unknown, Value, Error>,
): Plan<Value, Error> {
	if (!isGenerator(generator)) {
		throw new Error(PLAN_MESSAGE_PLAN_INPUT);
	}

	// @ts-expect-error All good, no worries :-)
	return new Plan(generator) as Plan<Value, Error>;
}

/**
 * Run a generator to completion
 *
 * @param generator Generator to run
 * @returns Result
 */
export function run<Value = unknown, Error = unknown>(
	generator: () => Generator<unknown, Value, unknown>,
): Result<Value, Error>;

/**
 * Run a plan to completion
 *
 * @param plan Plan to run
 * @returns Result
 */
export function run<Value = unknown, Error = unknown>(
	plan: Plan<Value, Error>,
): Result<Value, Error>;

export function run(input: unknown): unknown {
	if (isPlan(input)) {
		return input.run();
	}

	if (!isGenerator(input)) {
		throw new Error(PLAN_MESSAGE_RUN_INPUT);
	}

	return execute(input);
}

function runAsyncPlan(this: InternalAsyncPlan): Promise<unknown> {
	return asyncExecute(this[PLAN_SYMBOL].generator);
}

function runPlan(this: InternalPlan): unknown {
	return execute(this[PLAN_SYMBOL].generator);
}

// #endregion

// #region Namespaces

export declare namespace plan {
	export var async: typeof asyncPlan;
}

export declare namespace run {
	export var async: typeof asyncRun;
}

// #endregion

// #region Initialization

plan.async = asyncPlan;
run.async = asyncRun;

// #endregion
