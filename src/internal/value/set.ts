import type {ArrayOrPlainObject, Paths, PlainObject} from '../../models';
import {getPaths, handleValue} from './misc';

/**
 * - Set the value in an object using a known path
 * - You can set a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If a part of the path does not exist, it will be created, either as an array or a generic object, depending on the path
 * - Returns the original object
 */
export function setValue<
	Data extends ArrayOrPlainObject,
	Path extends Paths<Data>,
>(data: Data, path: Path, value: unknown): Data;

/**
 * - Set the value in an object using an unknown path
 * - You can set a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If a part of the path does not exist, it will be created, either as an array or a generic object, depending on the path
 * - If `ignoreCase` is `true`, path matching will be case-insensitive
 * - Returns the original object
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
