import type {PlainObject} from '../models';
import {
	type AsyncPlan,
	GENERATOR_NAME_ASYNC,
	GENERATOR_NAME_SYNC,
	type Plan,
	PLAN_SYMBOL,
	PLAN_TYPE_PLAN_ASYNC,
	PLAN_TYPE_PLAN_SYNC,
	type PlanType,
} from './models/plan.model';

// #region Functions

/**
 * Create an immediately failing generator
 *
 * @param reason Failure reason
 * @returns Failing generator
 */
export function fail<Reason>(reason: Reason): Generator<unknown, never> {
	return (function* () {
		yield;

		throw reason;
	})();
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

/**
 * Create an immediately succeeding generator
 *
 * @param value Success value
 * @returns Succeeding generator
 */
export function succeed<Value>(value: Value): Generator<unknown, Value> {
	return (function* () {
		yield;

		return value;
	})();
}

// #endregion
