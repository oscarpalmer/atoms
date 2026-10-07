import {isArrayOrPlainObject} from '../internal/is';
import {max, min} from '../internal/math/aggregate';
import {join} from '../internal/string/misc';
import {equal} from '../internal/value/equal';
import {
	DIFF_FULL,
	DIFF_NONE,
	DIFF_PARTIAL,
	type DiffKeyedValue,
	type DiffOptions,
	type DiffParameters,
	type DiffResult,
} from '../models/value/value.diff.model';

// #region Functions

/**
 * Find the differences between two values
 *
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

	const diffResult: DiffResult<First, Second> = {
		original: {
			from: first,
			to: second,
		},
		type: DIFF_PARTIAL,
		values: {},
	};

	const same = (relaxedNullish && first == null && second == null) || Object.is(first, second);

	const firstIsArrayOrObject = isArrayOrPlainObject(first);
	const secondIsArrayOrObject = isArrayOrPlainObject(second);

	if (same || !(firstIsArrayOrObject || secondIsArrayOrObject)) {
		diffResult.type = same ? DIFF_NONE : DIFF_FULL;

		return diffResult;
	}

	if (firstIsArrayOrObject !== secondIsArrayOrObject) {
		diffResult.type = DIFF_FULL;

		return diffResult;
	}

	const diffs = getDiffs(first, second, {relaxedNullish});

	const {length} = diffs;

	if (length === 0) {
		diffResult.type = DIFF_NONE;
	}

	for (let index = 0; index < length; index += 1) {
		const differences = diffs[index];

		diffResult.values[differences.key] = {from: differences.from, to: differences.to};
	}

	return diffResult;
}

function getChanges(
	changes: DiffKeyedValue[],
	first: unknown,
	second: unknown,
	options: Required<DiffOptions>,
	prefix?: string,
): DiffKeyedValue[] {
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
				options,
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
	options: Required<DiffOptions>,
	prefix?: string,
): DiffKeyedValue[] {
	const changes: DiffKeyedValue[] = [];

	if (Array.isArray(first) && Array.isArray(second)) {
		const maximumLength = max([first.length, second.length]);
		const minimumLength = min([first.length, second.length]);

		for (let index = minimumLength; index < maximumLength; index += 1) {
			const key = join([prefix, index], '.');

			changes.push({
				key,
				from: index >= first.length ? undefined : first[index],
				to: index >= first.length ? second[index] : undefined,
			});
		}
	}

	return getChanges(changes, first, second, options, prefix);
}

function setChanges(parameters: DiffParameters): void {
	const {changes, key, prefix, options, values} = parameters;

	const prefixed = join([prefix, key], '.');

	const from: unknown = values.first?.[key as never];
	const to: unknown = values.second?.[key as never];

	const nested = isArrayOrPlainObject(from) || isArrayOrPlainObject(to);
	const diffs = nested ? getDiffs(from, to, options, prefixed) : [];

	if (nested ? diffs.length === 0 : equal(from, to, options)) {
		return;
	}

	const change = {
		from,
		to,
		key: prefixed,
	};

	changes.push(change);

	const diffsLength = diffs.length;

	for (let diffIndex = 0; diffIndex < diffsLength; diffIndex += 1) {
		changes.push(diffs[diffIndex]);
	}
}

// #endregion

// #region Exports

export type {DiffOptions, DiffResult};

// #endregion
