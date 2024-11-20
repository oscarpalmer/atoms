import {handleValue} from '../internal/value/handle';
import type {ArrayOrPlainObject, Paths, PlainObject} from '../models';

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
	const shouldIgnoreCase = ignoreCase === true;
	const parts = (shouldIgnoreCase ? path.toLowerCase() : path).split('.');
	const {length} = parts;
	const lastIndex = length - 1;

	let target: ArrayOrPlainObject = data;

	for (let index = 0; index < length; index += 1) {
		const part = parts[index];

		if (index === lastIndex) {
			handleValue(target, part, value, false, shouldIgnoreCase);

			break;
		}

		let next = handleValue(target, part, null, true, shouldIgnoreCase);

		if (typeof next !== 'object' || next === null) {
			next = {};

			(target as PlainObject)[part] = next;
		}

		target = next as ArrayOrPlainObject;
	}

	return data;
}
