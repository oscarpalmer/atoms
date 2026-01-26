import type {Constructor} from '../../models';
import {max} from '../math/aggregate';
import {getString, words} from '../string';
import {getCompareHandlers} from './handlers';

// #region Types

type Comparator<Value = any> = (first: Value, second: Value) => number;

// #endregion

// #region Functions

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

	let comparison = compareValue(first, second, false);

	if (comparison != null) {
		return comparison;
	}

	const firstParts = getComparisonParts(first);
	const secondParts = getComparisonParts(second);
	const length = max([firstParts.length, secondParts.length]);
	const lastIndex = length - 1;

	for (let index = 0; index < length; index += 1) {
		const firstPart = firstParts[index];
		const secondPart = secondParts[index];

		comparison = compareValue(firstPart, secondPart, true);

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

compare.handlers = getCompareHandlers<number>(compare, {
	callback: (first, second, compareStrings) => {
		if (compareStrings) {
			return getString(first).localeCompare(getString(second));
		}
	},
	method: 'compare',
});

/**
 * Register a custom comparison handler for a class
 * @param constructor Class constructor
 * @param handler Method name or comparison function _(defaults to `compare`)_
 */
compare.register = function <Instance>(
	constructor: Constructor<Instance>,
	handler?: string | ((first: Instance, second: Instance) => number),
): void {
	compare.handlers.register(constructor, handler);
};

/**
 * Unregister a custom comparison handler for a class
 * @param constructor Class constructor
 */
compare.unregister = compare.handlers.unregister;

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

	return compare.handlers.handle(first, second, compareStrings);
}

function getComparisonParts(value: unknown): unknown[] {
	if (Array.isArray(value)) {
		return value;
	}

	return typeof value === 'object' ? [value] : words(getString(value));
}

// #endregion

// #region Constants

const comparators: Record<string, Comparator> = {
	bigint: compareNumbers,
	boolean: compareNumbers,
	number: compareNumbers,
	symbol: compareSymbols,
};

// #endregion
