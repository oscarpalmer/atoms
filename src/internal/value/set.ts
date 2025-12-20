import type {NestedKeys, PlainObject} from '../../models';
import {getPaths, handleValue} from './misc';

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
	value: unknown,
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
		const path = paths[index];

		if (index === lastIndex) {
			handleValue(target, path, value, false, shouldIgnoreCase);

			break;
		}

		let next = handleValue(target, path, null, true, shouldIgnoreCase);

		if (typeof next !== 'object' || next === null) {
			const nextPath = paths[index + 1];

			if (EXPRESSION_INDEX.test(nextPath)) {
				const length = Number.parseInt(nextPath, 10) + 1;

				next = Array.from({length}, () => undefined);
			} else {
				next = {};
			}

			(target as PlainObject)[path] = next;
		}

		target = next as PlainObject;
	}

	return data;
}

//

const EXPRESSION_INDEX = /^\d+$/;
