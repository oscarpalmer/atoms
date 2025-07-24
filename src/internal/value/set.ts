import type {ArrayOrPlainObject, Paths, PlainObject} from '../../models';
import {getPaths, handleValue} from './misc';

/**
 * Set the value in an object using a known path
 * @param data Object to set the value in
 * @param path Path to the value, e.g., `foo.bar.baz`
 * @param value Value to set at the specified path
 * @returns Original object with the value set
 */
export function setValue<
	Data extends ArrayOrPlainObject,
	Path extends Paths<Data>,
>(data: Data, path: Path, value: unknown): Data;

/**
 * Set the value in an object using an unknown path
 * @param data Object to set the value in
 * @param path Path to the value, e.g., `foo.bar.baz`
 * @param value Value to set at the specified path
 * @param ignoreCase If `true`, the path matching is case-insensitive
 * @returns Original object with the value set
 */
export function setValue<Data extends ArrayOrPlainObject>(
	data: Data,
	path: string,
	value: unknown,
	ignoreCase?: boolean,
): Data;

export function setValue<Data extends ArrayOrPlainObject>(
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

	let target: ArrayOrPlainObject = data;

	for (let index = 0; index < length; index += 1) {
		const path = paths[index];

		if (index === lastIndex) {
			handleValue(target, path, value, false, shouldIgnoreCase);

			break;
		}

		let next = handleValue(target, path, null, true, shouldIgnoreCase);

		if (typeof next !== 'object' || next === null) {
			const nextPath = paths[index + 1];

			if (indexExpression.test(nextPath)) {
				const length = Number.parseInt(nextPath, 10) + 1;

				next = Array.from({length}, () => undefined);
			} else {
				next = {};
			}

			(target as PlainObject)[path] = next;
		}

		target = next as ArrayOrPlainObject;
	}

	return data;
}

//

const indexExpression = /^\d+$/;
