import {
	GENERATOR_NAME_ASYNC,
	GENERATOR_NAME_SYNC,
	PLAN_SYMBOL,
	PLAN_TYPE_PLAN_ASYNC,
	PLAN_TYPE_PLAN_SYNC,
	type AsyncPlan,
	type Plan,
	type PlanType,
} from '../internal/models/plan.model';
import type {PlainObject} from '../models';

// #region Functions

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
	return isPlanInstance(PLAN_TYPE_PLAN_ASYNC, value);
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
export function isPlan<
	Yielded = unknown,
	Returned = unknown,
	Parameters extends unknown[] = unknown[],
>(value: unknown): value is Plan<Yielded, Returned, Parameters> {
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

// #endregion
