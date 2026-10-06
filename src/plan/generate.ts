import {isError} from '../internal/result/misc';

// #region Functions

export async function asyncGenerate(
	callback: (...parameters: unknown[]) => AsyncGenerator,
	parameters: unknown[],
): Promise<unknown> {
	const generator = callback(...parameters);

	let success = true;
	let lastValue: unknown;

	try {
		while (true) {
			const next = await generator.next(lastValue);
			const {done} = next;

			let {value} = next;

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
		await generator?.return(lastValue);
	}

	if (success) {
		return lastValue;
	}

	throw lastValue;
}

export function generate(
	callback: (...parameters: unknown[]) => Generator,
	parameters: unknown[],
): unknown {
	const generator = callback(...parameters);

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
		return lastValue;
	}

	throw lastValue;
}

// #endregion
