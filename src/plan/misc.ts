import {error} from '../internal/result/misc';
import {PLAN_SYMBOL, type PlanFailure, type PlanSuccess} from '../models/plan.model';

// #region Instances

function PlanFailure(this: any, generator: Generator): void {
	this[PLAN_SYMBOL] = {
		generator,
	};
}

PlanFailure.prototype[Symbol.iterator] = function () {
	return this[PLAN_SYMBOL].generator();
};

function PlanSuccess(this: any, generator: Generator): void {
	this[PLAN_SYMBOL] = {
		generator,
	};
}

PlanSuccess.prototype[Symbol.iterator] = function () {
	return this[PLAN_SYMBOL].generator();
};

// #endregion

// #region Functions

/**
 * Create an immediately failing plan
 *
 * @param value Failure value
 * @returns Plan failure
 */
export function fail<Value>(value: Value): PlanFailure<Value> {
	// @ts-expect-error All good, no worries :-)
	return new PlanFailure(function* () {
		yield error(value);
	});
}

/**
 * Create an immediately succeeding plan
 *
 * @param value Success value
 * @returns Plan success
 */
export function succeed<Value>(value: Value): PlanSuccess<Value> {
	// @ts-expect-error All good, no worries :-)
	return new PlanSuccess(function* () {
		return value;
	});
}

// #endregion
