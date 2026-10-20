import {
	PLAN_SYMBOL,
	type GenericPlanItem,
	type InternalAsyncPlan,
	type InternalPlan,
} from '../../models/plan.model';
import {attempt} from '../result/attempt';
import {asyncGenerate, generate} from './plan.generate';

// #region Functions

export function attemptRunPlan(this: InternalPlan, ...parameters: unknown[]): unknown {
	return attempt(() => generate(this[PLAN_SYMBOL], parameters, true));
}

export function getGenerator(this: GenericPlanItem): AsyncGenerator | Generator {
	return this[PLAN_SYMBOL].generator();
}

export function runAsyncPlan(
	this: InternalAsyncPlan,
	first: never,
	second: never,
): Promise<unknown> {
	return asyncGenerate(this[PLAN_SYMBOL], false, first, second);
}

export function runPlan(this: InternalPlan, ...parameters: unknown[]): unknown {
	return generate(this[PLAN_SYMBOL], parameters, false);
}

// #endregion
