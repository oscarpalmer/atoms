import type {Constructor} from '../../models';
import {max} from '../math/aggregate';
import {getString, words} from '../string';
import {getCompareHandlers} from './handlers';

// #region Types

type Comparator<Value = any> = (first: Value, second: Value) => number;

// #endregion

// #region Special variables

const COMPARE_NAME: string = 'compare';

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
	method: COMPARE_NAME,
});

compare.deregister = deregisterComparator;
compare.register = registerComparator;

function compareNumbers(first: bigint | number, second: bigint | number): number {
	if (Object.is(first, second)) {
		return 0;
	}

	if (Number.isNaN(first)) {
		return -1;
	}

	if (Number.isNaN(second)) {
		return 1;
	}

	return first > second ? 1 : -1;
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

/**
 * Deregister a custom comparison handler for a class
 *
 * Available as `deregisterComparator` and `compare.deregister`
 * @param constructor Class constructor
 */
export function deregisterComparator<Instance>(constructor: Constructor<Instance>): void {
	compare.handlers.deregister(constructor);
}

function getComparisonParts(value: unknown): unknown[] {
	if (Array.isArray(value)) {
		return value;
	}

	return typeof value === 'object' ? [value] : words(getString(value));
}

/**
 * Register a custom comparison handler for a class
 *
 * Available as `registerComparator` and `compare.register`
 * @param constructor Class constructor
 * @param handler Method name or comparison function _(defaults to `compare`)_
 */
export function registerComparator<Instance>(
	constructor: Constructor<Instance>,
	handler?: string | ((first: Instance, second: Instance) => number),
): void {
	compare.handlers.register(constructor, handler);
}

// #endregion

// #region Variables

const comparators: Record<string, Comparator> = {
	bigint: compareNumbers,
	boolean: (first, second) => compareNumbers(first ? 1 : 0, second ? 1 : 0),
	number: compareNumbers,
	symbol: compareSymbols,
};

// #endregion
