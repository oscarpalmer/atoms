import {
	type InternalPlan,
	type Plan,
	GENERATOR_NAME,
	PLAN_MESSAGE_PLAN_INPUT,
	PLAN_MESSAGE_RUN_INPUT,
	PLAN_SYMBOL,
} from '../internal/models/plan.model';
import {attempt} from '../internal/result/attempt';

// #region Instances

function Plan(this: any, generator: () => Generator): void {
	this[PLAN_SYMBOL] = {
		generator,
	};
}

Plan.prototype.run = runPlan;

// #endregion

// #region Functions

function execute(callback: () => Generator): unknown {
	const result = attempt(() => {
		const generator = callback();

		let lastValue: unknown;

		while (true) {
			const next = generator.next();
			const {done} = next;
			let {value} = next;

			if (value instanceof Error) {
				throw value;
			}

			lastValue = value;

			if (done === true) {
				break;
			}
		}

		return lastValue;
	});

	return result.ok ? result.value : result.error;
}

/**
 * Is the value a generator function?
 *
 * @param value Value to check
 * @returns `true` if the value is a generator function, otherwise `false`
 */
export function isGenerator(value: unknown): value is () => Generator {
	return (
		typeof value === 'function' &&
		value.constructor.name === GENERATOR_NAME &&
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
	return typeof value === 'object' && value !== null && PLAN_SYMBOL in value;
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
 * @returns Final result, or an error
 */
export function run<Value = unknown, Error = unknown>(
	generator: () => Generator<unknown, Value, unknown>,
): Error | Value;

/**
 * Run a plan to completion
 *
 * @param plan Plan to run
 * @returns Final result, or an error
 */
export function run<Value = unknown, Error = unknown>(plan: Plan<Value, Error>): Error | Value;

export function run(input: unknown): unknown {
	if (isPlan(input)) {
		return input.run();
	}

	if (!isGenerator(input)) {
		throw new Error(PLAN_MESSAGE_RUN_INPUT);
	}

	return execute(input as () => Generator);
}

function runPlan(this: InternalPlan): unknown {
	return execute(this[PLAN_SYMBOL].generator);
}

// #endregion
