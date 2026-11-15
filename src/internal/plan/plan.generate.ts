import type {AsyncPlanState, PlanState} from '../../models/plan.model';
import {createAborter} from '../aborter';
import {noop} from '../function/misc';
import {isError, isOk} from '../result/is';

// #region Functions

async function asyncCleanup(generator: AsyncGenerator, input: unknown): Promise<void> {
	try {
		const returned = await generator.return(input);

		if (returned.done) {
			return;
		}

		let cleanupValue = returned.value;

		while (true) {
			const {done, value} = await generator.next(cleanupValue);

			if (done) {
				break;
			}

			cleanupValue = value;
		}
	} catch {
		// Ignore any errors during cleanup
	}
}

export async function asyncGenerate(
	input: AsyncPlanState | ((...args: unknown[]) => AsyncGenerator),
	unwrap: boolean,
	first?: unknown,
	second?: unknown,
): Promise<unknown> {
	const aborter = createAborter(second ?? first, noop);

	if (aborter?.signal.aborted) {
		throw aborter.signal.reason;
	}

	const parameters = Array.isArray(first) ? first : [];

	let generator: AsyncGenerator;

	if (typeof input === 'function') {
		generator = input(...parameters);
	} else {
		generator = input.generator(...parameters);
	}

	let aborted = false;
	let success = true;
	let throwing = false;

	let lastError: unknown;
	let lastValue: unknown;

	try {
		while (true) {
			if (aborter?.signal.aborted) {
				if (aborted) {
					// Generator has already been told about the abort, so we stop driving it
					break;
				}

				aborted = true;
				lastError = aborter.signal.reason;
				throwing = true;
			}

			const {done, value} = await asyncResume(
				generator,
				throwing ? lastError : lastValue,
				throwing,
			);

			if (value instanceof Error || isError(value)) {
				const errorValue = value instanceof Error ? value : value.error;

				if (done) {
					throw errorValue;
				}

				lastError = errorValue;
				lastValue = undefined;
				throwing = true;

				continue;
			}

			lastError = undefined;
			lastValue = value;
			throwing = false;

			if (done) {
				break;
			}
		}
	} catch (error: unknown) {
		lastError = error;
		success = false;
	} finally {
		aborter?.cancel();

		await asyncCleanup(generator, lastValue);
	}

	if (aborter?.signal.aborted) {
		throw aborter.signal.reason;
	}

	if (success) {
		return unwrap && isOk(lastValue) ? lastValue.value : lastValue;
	}

	throw lastError;
}

async function asyncResume(
	generator: AsyncGenerator,
	input: unknown,
	throwing: boolean,
): Promise<{done: boolean; value: unknown}> {
	const {done, value} = await (throwing ? generator.throw(input) : generator.next(input));

	return {value, done: done === true};
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
	let throwing = false;

	let lastError: unknown;
	let lastValue: unknown;

	try {
		while (true) {
			const {done, value} = resume(generator, throwing ? lastError : lastValue, throwing);

			if (value instanceof Error || isError(value)) {
				const errorValue = value instanceof Error ? value : value.error;

				if (done) {
					throw errorValue;
				}

				lastError = errorValue;
				lastValue = undefined;
				throwing = true;

				continue;
			}

			lastError = undefined;
			lastValue = value;
			throwing = false;

			if (done) {
				break;
			}
		}
	} catch (error: unknown) {
		lastError = error;
		success = false;
	}

	if (success) {
		return unwrap && isOk(lastValue) ? lastValue.value : lastValue;
	}

	throw lastError;
}

function resume(
	generator: Generator,
	input: unknown,
	throwing: boolean,
): {done: boolean; value: unknown} {
	const {done, value} = throwing ? generator.throw(input) : generator.next(input);

	return {value, done: done === true};
}

// #endregion
