import {isArrayOrPlainObject} from '../internal/is';
import {join} from '../internal/string';
import {equal} from '../internal/value/equal';

/**
 * Options for value comparison
 */
export type DiffOptions = {
	/**
	 * Should `null` and `undefined` be considered equal and ignored in results?
	 */
	relaxedNullish?: boolean;
};

/**
 * The result of a comparison beteen two values
 */
export type DiffResult<First, Second = First> = {
	/**
	 * The original values that were compared
	 */
	original: DiffValue<First, Second>;
	/**
	 * The type of difference between the two values
	 */
	type: DiffType;
	/**
	 * - The differences between the two values
	 * - Keys are in dot notation
	 * - Values are objects with `from` and `to` properties
	 */
	values: Record<string, DiffValue>;
};

type DiffType = 'full' | 'none' | 'partial';

/**
 * The difference between two values
 */
export type DiffValue<First = unknown, Second = First> = {
	/**
	 * The value from the first value
	 */
	from: First;
	/**
	 * The value from the second value
	 */
	to: Second;
};

type KeyedDiffValue = {
	key: string;
} & DiffValue;

type Parameters = {
	changes: KeyedDiffValue[];
	key: PropertyKey;
	values: {first: unknown; second: unknown};
	relaxedNullish: boolean;
	prefix?: string;
};

//

/**
 * Find the differences between two values
 * @param first First value
 * @param second Second value
 * @param options Comparison options
 * @returns Difference result
 */
export function diff<First, Second = First>(
	first: First,
	second: Second,
	options?: DiffOptions,
): DiffResult<First, Second> {
	const relaxedNullish = typeof options === 'object' && options?.relaxedNullish === true;

	const result: DiffResult<First, Second> = {
		original: {
			from: first,
			to: second,
		},
		type: 'partial',
		values: {},
	};

	const same = (relaxedNullish && first == null && second == null) || Object.is(first, second);

	const firstIsArrayOrObject = isArrayOrPlainObject(first);
	const secondIsArrayOrObject = isArrayOrPlainObject(second);

	if (same || !(firstIsArrayOrObject || secondIsArrayOrObject)) {
		result.type = same ? 'none' : 'full';

		return result;
	}

	if (firstIsArrayOrObject !== secondIsArrayOrObject) {
		result.type = 'full';

		return result;
	}

	const diffs = getDiffs(first, second, relaxedNullish);

	const {length} = diffs;

	if (length === 0) {
		result.type = 'none';
	}

	for (let index = 0; index < length; index += 1) {
		const differences = diffs[index];

		result.values[differences.key] = {from: differences.from, to: differences.to};
	}

	return result;
}

function getChanges(
	changes: KeyedDiffValue[],
	first: unknown,
	second: unknown,
	relaxedNullish: boolean,
	prefix?: string,
): KeyedDiffValue[] {
	const checked = new Set<PropertyKey>();

	for (let outerIndex = 0; outerIndex < 2; outerIndex += 1) {
		const value = (outerIndex === 0 ? first : second) ?? {};

		const keys = [...Object.keys(value), ...Object.getOwnPropertySymbols(value)];

		const {length} = keys;

		for (let innerIndex = 0; innerIndex < length; innerIndex += 1) {
			const key = keys[innerIndex];

			if (checked.has(key)) {
				continue;
			}

			checked.add(key);

			setChanges({
				changes,
				key,
				relaxedNullish,
				prefix,
				values: {first, second},
			});
		}
	}

	return changes;
}

function getDiffs(
	first: unknown,
	second: unknown,
	relaxedNullish: boolean,
	prefix?: string,
): KeyedDiffValue[] {
	const changes: KeyedDiffValue[] = [];

	if (Array.isArray(first) && Array.isArray(second)) {
		const maximumLength = Math.max(first.length, second.length);
		const minimumLength = Math.min(first.length, second.length);

		for (let index = minimumLength; index < maximumLength; index += 1) {
			const key = join([prefix, index], '.');

			changes.push({
				key,
				from: index >= first.length ? undefined : first[index],
				to: index >= first.length ? second[index] : undefined,
			});
		}
	}

	return getChanges(changes, first, second, relaxedNullish, prefix);
}

function setChanges(parameters: Parameters): void {
	const {changes, key, prefix, relaxedNullish, values} = parameters;

	const from = values.first?.[key as never];
	const to = values.second?.[key as never];

	if (equal(from, to, {relaxedNullish})) {
		return;
	}

	const prefixed = join([prefix, key], '.');

	const change = {
		from,
		to,
		key: prefixed,
	};

	const nested = isArrayOrPlainObject(from) || isArrayOrPlainObject(to);

	const diffs = nested ? getDiffs(from, to, relaxedNullish, prefixed) : [];

	changes.push(change);

	const diffsLength = diffs.length;

	for (let diffIndex = 0; diffIndex < diffsLength; diffIndex += 1) {
		changes.push(diffs[diffIndex]);
	}
}
