import {isArrayOrPlainObject} from '../internal/is';
import {join} from '../internal/string';
import {equal} from '../internal/value/equal';
import type {ArrayOrPlainObject} from '../models';

export type DiffType = 'full' | 'none' | 'partial';

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

/**
 * Find the differences between two values
 * @param first First value to compare
 * @param second Second value to compare
 * @returns The differences between the two values
 */
export function diff<First, Second = First>(
	first: First,
	second: Second,
): DiffResult<First, Second> {
	const result: DiffResult<First, Second> = {
		original: {
			from: first,
			to: second,
		},
		type: 'partial',
		values: {},
	};

	const same = Object.is(first, second);

	const firstIsArrayOrObject = isArrayOrPlainObject(first);
	const secondIsArrayOrObject = isArrayOrPlainObject(second);

	if (same || (!firstIsArrayOrObject && !secondIsArrayOrObject)) {
		result.type = same ? 'none' : 'full';

		return result;
	}

	if (firstIsArrayOrObject !== secondIsArrayOrObject) {
		result.type = 'full';

		return result;
	}

	const diffs = getDiffs(
		first as ArrayOrPlainObject,
		second as ArrayOrPlainObject,
	);

	const {length} = diffs;

	if (length === 0) {
		result.type = 'none';
	}

	for (let index = 0; index < length; index += 1) {
		const diff = diffs[index];

		result.values[diff.key] = {from: diff.from, to: diff.to};
	}

	return result;
}

function getDiffs(
	first: ArrayOrPlainObject,
	second: ArrayOrPlainObject,
	prefix?: string,
): KeyedDiffValue[] {
	const changes: KeyedDiffValue[] = [];
	const checked = new Set<PropertyKey>();

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

	for (let outerIndex = 0; outerIndex < 2; outerIndex += 1) {
		const value = (outerIndex === 0 ? first : second) ?? {};

		const keys = [
			...Object.keys(value),
			...Object.getOwnPropertySymbols(value),
		];
		const {length} = keys;

		for (let innerIndex = 0; innerIndex < length; innerIndex += 1) {
			const key = keys[innerIndex];

			if (checked.has(key)) {
				continue;
			}

			const from = first?.[key as never];
			const to = second?.[key as never];

			if (!equal(from, to)) {
				const prefixed = join([prefix, key], '.');

				const change = {
					from,
					to,
					key: prefixed,
				};

				const nested = isArrayOrPlainObject(from) || isArrayOrPlainObject(to);

				const diffs = nested
					? getDiffs(
							from as ArrayOrPlainObject,
							to as ArrayOrPlainObject,
							prefixed,
						)
					: [];

				if (!nested || (nested && diffs.length > 0)) {
					changes.push(change);
				}

				const diffsLength = diffs.length;

				for (let diffIndex = 0; diffIndex < diffsLength; diffIndex += 1) {
					changes.push(diffs[diffIndex]);
				}
			}

			checked.add(key);
		}
	}

	return changes;
}
