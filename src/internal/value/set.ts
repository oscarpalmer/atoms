import type {NestedKeys, NestedValue, PlainObject} from '../../models';
import {getPaths, handleValue} from './misc';

// #region Functions

/**
 * Update the value in an object using a known path
 * @param data Object to set value in
 * @param path Path for value, e.g., `foo.bar.baz`
 * @param updater Function to update the current value
 * @returns Updated object
 */
export function setValue<Data extends PlainObject, Path extends NestedKeys<Data>>(
	data: Data,
	path: Path,
	updater: (current: NestedValue<Data, Path>) => NestedValue<Data, Path>,
): Data;

/**
 * Set the value in an object using a known path
 * @param data Object to set value in
 * @param path Path for value, e.g., `foo.bar.baz`
 * @param value Value to set
 * @returns Updated object
 */
export function setValue<Data extends PlainObject, Path extends NestedKeys<Data>>(
	data: Data,
	path: Path,
	value: NestedValue<Data, Path>,
): Data;

/**
 * Set the value in an object using an unknown path
 * @param data Object to set value in
 * @param path Path for value, e.g., `foo.bar.baz`
 * @param value Value to set
 * @param ignoreCase If `true`, the path matching is case-insensitive
 * @returns Updated object
 */
export function setValue<Data extends PlainObject>(
	data: Data,
	path: string,
	value: unknown,
	ignoreCase?: boolean,
): Data;

export function setValue<Data extends PlainObject>(
	data: Data,
	path: string,
	value: unknown,
	ignoreCase?: boolean,
): Data {
	if (
		typeof data !== 'object' ||
		data === null ||
		typeof path !== 'string' ||
		path.trim().length === 0
	) {
		return data;
	}

	const shouldIgnoreCase = ignoreCase === true;
	const paths = getPaths(path, shouldIgnoreCase);

	if (typeof paths === 'string') {
		handleValue(data, paths, value, false, shouldIgnoreCase);

		return data;
	}

	const {length} = paths;
	const lastIndex = length - 1;

	let target: PlainObject = data;

	for (let index = 0; index < length; index += 1) {
		const currentPath = paths[index];

		if (index === lastIndex) {
			handleValue(target, currentPath, value, false, shouldIgnoreCase);

			break;
		}

		let next = handleValue(target, currentPath, null, true, shouldIgnoreCase);

		if (typeof next !== 'object' || next === null) {
			const nextPath = paths[index + 1];

			if (EXPRESSION_INDEX.test(nextPath)) {
				next = Array.from({length: Number.parseInt(nextPath, 10) + 1}, () => undefined);
			} else {
				next = {};
			}

			(target as PlainObject)[currentPath] = next;
		}

		target = next as PlainObject;
	}

	return data;
}

// #endregion

// #region Constants

const EXPRESSION_INDEX = /^\d+$/;

// #endregion
