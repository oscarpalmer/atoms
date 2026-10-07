import {isError, isOk} from '../internal/result/misc';
import type {AsyncPlanState, PlanState} from '../models/plan.model';

// #region Functions

export async function asyncGenerate(
	input: AsyncPlanState | ((...parameters: unknown[]) => AsyncGenerator),
	parameters: unknown[],
	unwrap: boolean,
): Promise<unknown> {
	let generator: AsyncGenerator;

	if (typeof input === 'function') {
		generator = input(...parameters);
	} else {
		generator = input.generator(...parameters);
	}

	let success = true;
	let lastValue: unknown;

	try {
		while (true) {
			const next = await generator.next(lastValue);
			const done = next.done === true;

			const {value} = next;

			if (value instanceof Error) {
				throw value;
			}

			if (isError(value)) {
				throw value.error;
			}

			lastValue = value;

			if (done === true) {
				break;
			}
		}
	} catch (error) {
		lastValue = error;
		success = false;
	} finally {
		await generator.return(lastValue);
	}

	if (success) {
		return unwrap && isOk(lastValue) ? lastValue.value : lastValue;
	}

	throw lastValue;
}

export function generate(
	input: PlanState | ((...parameters: unknown[]) => Generator),
	parameters: unknown[],
	unwrap: boolean,
): unknown {
	let generator: Generator;

	if (typeof input === 'function') {
		generator = input(...parameters);
	} else {
		generator = input.generator(...parameters);
	}

	let success = true;
	let lastValue: unknown;

	try {
		while (true) {
			const next = generator.next(lastValue);
			const done = next.done === true;

			const {value} = next;

			if (value instanceof Error) {
				throw value;
			}

			if (isError(value)) {
				throw value.error;
			}

			lastValue = value;

			if (done) {
				break;
			}
		}
	} catch (error) {
		lastValue = error;
		success = false;
	} finally {
		generator.return(lastValue);
	}

	if (success) {
		return unwrap && isOk(lastValue) ? lastValue.value : lastValue;
	}

	throw lastValue;
}

// #endregion
