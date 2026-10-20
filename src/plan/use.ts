import {getGenerator} from '../internal/plan';
import {isError, isOk} from '../internal/result/misc';
import {
	PLAN_STEP_ASYNC,
	PLAN_STEP_SYNC,
	PLAN_SYMBOL,
	type AsyncStep,
	type AsyncStepValue,
	type GenericPlanItem,
	type InternalAsyncStep,
	type InternalStep,
	type Step,
	type StepValue,
} from '../models/plan.model';
import {
	isAsyncFailure,
	isAsyncGenerator,
	isAsyncGeneratorFunction,
	isAsyncPlan,
	isAsyncStep,
	isAsyncSuccess,
	isGenerator,
} from './is';
import {fail} from './misc';

// #region Instances

function AsyncStep(this: InternalAsyncStep, generator: () => AsyncGenerator): void {
	this[PLAN_SYMBOL] = {
		generator,
		type: PLAN_STEP_ASYNC,
	};
}

AsyncStep.prototype[Symbol.asyncIterator] = getGenerator;

function Step(this: InternalStep, generator: () => Generator): void {
	this[PLAN_SYMBOL] = {
		generator,
		type: PLAN_STEP_SYNC,
	};
}

Step.prototype[Symbol.iterator] = getGenerator;

// #endregion

// #region Functions

/**
 * Create an asynchronous step from a callback
 *
 * @param callback Callback
 * @returns An asynchronous step
 */
export function asyncUse<Value>(callback: () => Value & AsyncStepValue<Value>): AsyncStep<Value>;

/**
 * Create an asynchronous step from a value
 *
 * @param value Value
 * @returns An asynchronous step
 */
export function asyncUse<Value>(value: Value & AsyncStepValue<Value>): AsyncStep<Value>;

export function asyncUse(value: unknown): AsyncStep<any> {
	// @ts-expect-error All good, no worries :-)
	return new AsyncStep(async function* (): any {
		let actual = value;

		if (typeof actual === 'function') {
			actual = actual();
		}

		actual = await actual;

		if (typeof actual === 'function') {
			throw new Error();
		}

		if (typeof actual === 'object' && actual !== null && PLAN_SYMBOL in actual) {
			const planned = actual as GenericPlanItem;

			return yield* planned;
		}

		if (isAsyncGenerator(actual) || isGenerator(actual)) {
			return yield* actual;
		}

		if (isError(actual)) {
			yield* fail(actual.error);

			return;
		}

		if (isOk(actual)) {
			return actual.value;
		}

		if (actual instanceof Error) {
			yield* fail(actual);

			return;
		}

		return actual;
	});
}

/**
 * Create a step from a callback
 *
 * @param callback Callback
 * @returns A step
 * @throws Error If the input is invalid
 */
export function use<Value>(callback: () => Value & StepValue<Value>): Step<Value>;

/**
 * Create a step from a value
 *
 * @param value Value
 * @returns A step
 * @throws Error If the input is invalid
 */
export function use<Value>(value: Value & StepValue<Value>): Step<Value>;

export function use(value: unknown): Step<any> {
	validateUseInput(value, false);

	// @ts-expect-error All good, no worries :-)
	return new Step(function* (): any {
		let actual = value;

		if (typeof actual === 'function') {
			actual = actual();

			validateUseInput(actual, true);
		}

		if (typeof actual === 'object' && actual !== null && PLAN_SYMBOL in actual) {
			const planned = actual as GenericPlanItem;

			return yield* planned;
		}

		if (isGenerator(actual)) {
			return yield* actual;
		}

		if (isError(actual)) {
			yield* fail(actual.error);

			return;
		}

		if (isOk(actual)) {
			return actual.value;
		}

		if (actual instanceof Error) {
			yield* fail(actual);

			return;
		}

		return actual;
	});
}

function validateUseInput(value: unknown, resolved: boolean): void {
	if (
		value instanceof Promise ||
		isAsyncFailure(value) ||
		isAsyncGenerator(value) ||
		isAsyncGeneratorFunction(value) ||
		isAsyncPlan(value) ||
		isAsyncStep(value) ||
		isAsyncSuccess(value)
	) {
		throw new Error();
	}

	if (resolved && typeof value === 'function') {
		throw new Error();
	}
}

// #endregion

// #region Namespaces

export declare namespace use {
	export var async: typeof asyncUse;
}

// #endregion

// #region Initialization

use.async = asyncUse;

// #endregion
