import {max} from '../math/aggregate';
import {getString, words} from '../string';

/**
 * Compare two values _(for sorting purposes)_
 * @param first First value
 * @param second Second value
 * @returns `0` if equal; `-1` first comes before second; `1` first comes after second
 */
export function compare(first: unknown, second: unknown): number {
	if (Object.is(first, second)) {
		return 0;
	}

	if (first == null) {
		return -1;
	}

	if (second == null) {
		return 1;
	}

	const comparison = compareValue(first, second, false);

	if (comparison != null) {
		return comparison;
	}

	const firstParts = getParts(first);
	const secondParts = getParts(second);
	const length = max([firstParts.length, secondParts.length]);
	const lastIndex = length - 1;

	for (let index = 0; index < length; index += 1) {
		const firstPart = firstParts[index];
		const secondPart = secondParts[index];

		const comparison = compareValue(firstPart, secondPart, true);

		if (comparison === 0) {
			if (index === lastIndex) {
				break;
			}

			continue;
		}

		return comparison as number;
	}

	return 0;
}

function compareNumbers(
	first: bigint | boolean | number,
	second: bigint | boolean | number,
): number {
	const firstNumber = Number(first);
	const secondNumber = Number(second);

	if (firstNumber === secondNumber) {
		return 0;
	}

	return firstNumber > secondNumber ? 1 : -1;
}

function compareSymbols(first: symbol, second: symbol): number {
	return getString(first.description ?? first).localeCompare(
		getString(second.description ?? second),
	);
}

function compareValue(
	first: unknown,
	second: unknown,
	compareStrings: boolean,
): number | undefined {
	const firstType = typeof first;
	const secondType = typeof second;

	if (firstType === secondType && firstType in comparators) {
		return comparators[firstType as keyof typeof comparators](first as never, second as never);
	}

	if (first instanceof Date && second instanceof Date) {
		return compareNumbers(first.getTime(), second.getTime());
	}

	if (compareStrings) {
		return getString(first).localeCompare(getString(second));
	}
}

function getParts(value: unknown): unknown[] {
	if (Array.isArray(value)) {
		return value;
	}

	return typeof value === 'object' ? [value] : words(getString(value));
}

//

const comparators: Record<string, (first: never, second: never) => number | undefined> = {
	bigint: compareNumbers,
	boolean: compareNumbers,
	number: compareNumbers,
	symbol: compareSymbols,
};
