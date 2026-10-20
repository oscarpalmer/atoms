import type {PlainObject} from '../models/index';
import {
	GENERATOR_FUNCTION_TYPE_ASYNC,
	GENERATOR_FUNCTION_TYPE_SYNC,
	GENERATOR_TYPE_ASYNC,
	GENERATOR_TYPE_SYNC,
	PLAN_FAILURE_ASYNC,
	PLAN_FAILURE_SYNC,
	PLAN_STEP_ASYNC,
	PLAN_STEP_SYNC,
	PLAN_SUCCESS_ASYNC,
	PLAN_SUCCESS_SYNC,
	PLAN_SYMBOL,
	PLAN_TYPE_ASYNC,
	PLAN_TYPE_SYNC,
	type AsyncFailure,
	type AsyncPlan,
	type AsyncStep,
	type AsyncSuccess,
	type Failure,
	type Plan,
	type Step,
	type Success,
} from '../models/plan.model';

// #region Functions

/**
 * Is the value an asynchronous, immediately failing plan?
 *
 * @param value Value to check
 * @returns `true` if the value is an asynchronous, immediately failing plan, otherwise `false`
 */
export function isAsyncFailure<Value = unknown>(value: unknown): value is AsyncFailure<Value> {
	return isPlanInstance(PLAN_FAILURE_ASYNC, value);
}

/**
 * Is the value an asynchronous generator?
 *
 * @param value Value to check
 * @returns `true` if the value is an asynchronous generator, otherwise `false`
 */
export function isAsyncGenerator<Y = unknown, R = unknown, N = unknown>(
	value: unknown,
): value is AsyncGenerator<Y, R, N> {
	return isGeneratorInstance(GENERATOR_TYPE_ASYNC, value);
}

/**
 * Is the value an asynchronous generator function?
 *
 * @param value Value to check
 * @returns `true` if the value is an asynchronous generator function, otherwise `false`
 */
export function isAsyncGeneratorFunction<Y = unknown, R = unknown, N = unknown>(
	value: unknown,
): value is () => AsyncGenerator<Y, R, N> {
	return isGeneratorInstance(GENERATOR_FUNCTION_TYPE_ASYNC, value);
}

/**
 * Is the value an asynchronous plan?
 *
 * @param value Value to check
 * @returns `true` if the value is an asynchronous plan, otherwise `false`
 */
export function isAsyncPlan<
	Yielded = unknown,
	Returned = unknown,
	Parameters extends unknown[] = unknown[],
>(value: unknown): value is AsyncPlan<Yielded, Returned, Parameters> {
	return isPlanInstance(PLAN_TYPE_ASYNC, value);
}

/**
 * Is the value an asynchronous step?
 *
 * @param value Value to check
 * @returns `true` if the value is an asynchronous step, otherwise `false`
 */
export function isAsyncStep<Value = unknown>(value: unknown): value is AsyncStep<Value> {
	return isPlanInstance(PLAN_STEP_ASYNC, value);
}

/**
 * Is the value an asynchronous, immediately successful plan?
 *
 * @param value Value to check
 * @returns `true` if the value is an asynchronous, immediately successful plan, otherwise `false`
 */
export function isAsyncSuccess<Value = unknown>(value: unknown): value is AsyncSuccess<Value> {
	return isPlanInstance(PLAN_SUCCESS_ASYNC, value);
}

/**
 * Is the value an immediately failing plan?
 *
 * @param value Value to check
 * @returns `true` if the value is an immediately failing plan, otherwise `false`
 */
export function isFailure<Value = unknown>(value: unknown): value is Failure<Value> {
	return isPlanInstance(PLAN_FAILURE_SYNC, value);
}

/**
 * Is the value a generator?
 *
 * @param value Value to check
 * @returns `true` if the value is a generator, otherwise `false`
 */
export function isGenerator<Y = unknown, R = unknown, N = unknown>(
	value: unknown,
): value is Generator<Y, R, N> {
	return isGeneratorInstance(GENERATOR_TYPE_SYNC, value);
}

/**
 * Is the value a generator function?
 *
 * @param value Value to check
 * @returns `true` if the value is a generator function, otherwise `false`
 */
export function isGeneratorFunction<Y = unknown, R = unknown, N = unknown>(
	value: unknown,
): value is () => Generator<Y, R, N> {
	return isGeneratorInstance(GENERATOR_FUNCTION_TYPE_SYNC, value);
}

function isGeneratorInstance(type: string, value: unknown): boolean {
	return Object.prototype.toString.call(value) === type;
}

/**
 * Is the value a plan?
 *
 * @param value Value to check
 * @returns `true` if the value is a plan, otherwise `false`
 */
export function isPlan<
	Yielded = unknown,
	Returned = unknown,
	Parameters extends unknown[] = unknown[],
>(value: unknown): value is Plan<Yielded, Returned, Parameters> {
	return isPlanInstance(PLAN_TYPE_SYNC, value);
}

function isPlanInstance(type: string, value: unknown): boolean {
	return (
		typeof value === 'object' &&
		value !== null &&
		PLAN_SYMBOL in value &&
		((value as PlainObject)[PLAN_SYMBOL] as PlainObject).type === type
	);
}

/**
 * Is the value a step?
 *
 * @param value Value to check
 * @returns `true` if the value is a step, otherwise `false`
 */
export function isStep<Value = unknown>(value: unknown): value is Step<Value> {
	return isPlanInstance(PLAN_STEP_SYNC, value);
}

/**
 * Is the value an immediately successful plan?
 *
 * @param value Value to check
 * @returns `true` if the value is an immediately successful plan, otherwise `false`
 */
export function isSuccess<Value = unknown>(value: unknown): value is Success<Value> {
	return isPlanInstance(PLAN_SUCCESS_SYNC, value);
}

// #endregion
