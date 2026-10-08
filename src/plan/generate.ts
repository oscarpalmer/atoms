import {createAborter} from '../internal/aborter';
import {noop} from '../internal/function/misc';
import {isError, isOk} from '../internal/result/misc';
import type {AsyncPlanState, PlanState} from '../models/plan.model';

// #region Functions

export async function asyncGenerate(
	input: AsyncPlanState | ((...args: unknown[]) => AsyncGenerator),
	unwrap: boolean,
	first?: unknown,
	second?: unknown,
): Promise<unknown> {
	const aborter = createAborter(second ?? first, noop);

	if (aborter != null && aborter.signal.aborted) {
		throw aborter.signal.reason;
	}

	const parameters = Array.isArray(first) ? first : [];

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
			if (aborter != null && aborter.signal.aborted) {
				await generator.throw(aborter.signal.reason);
			}

			const next = await generator.next(lastValue);
			const done = next.done === true;

			const {value} = next;

			if (value instanceof Error) {
				await generator.throw(value);
			}

			if (isError(value)) {
				await generator.throw(value.error);
			}

			lastValue = value;

			if (done === true) {
				break;
			}
		}
	} catch (error: unknown) {
		lastValue = error;
		success = false;
	} finally {
		aborter?.cancel();

		await generator.return(lastValue);
	}

	if (aborter != null && aborter.signal.aborted) {
		throw aborter.signal.reason;
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
				generator.throw(value);
			}

			if (isError(value)) {
				generator.throw(value.error);
			}

			lastValue = value;

			if (done) {
				break;
			}
		}
	} catch (error: unknown) {
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
