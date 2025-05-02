import type {ToString} from 'type-fest/source/internal/string';
import type {ArrayOrPlainObject, Get, Paths} from '../../models';
import {getPaths, handleValue} from './misc';

/**
 * - Get the value from an object using a known path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - Returns `undefined` if the value is not found
 */
export function getValue<
	Data extends ArrayOrPlainObject,
	Path extends Paths<Data>,
>(data: Data, path: Path): Get<Data, ToString<Path>>;

/**
 * - Get the value from an object using an unknown path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If `ignoreCase` is `true`, path matching will be case-insensitive
 * - Returns `undefined` if the value is not found
 */
export function getValue<Data extends ArrayOrPlainObject>(
	data: Data,
	path: string,
	ignoreCase?: boolean,
): unknown;

export function getValue(
	data: ArrayOrPlainObject,
	path: string,
	ignoreCase?: boolean,
): unknown {
	if (
		typeof data !== 'object' ||
		data === null ||
		typeof path !== 'string' ||
		path.trim().length === 0
	) {
		return;
	}

	const shouldIgnoreCase = ignoreCase === true;
	const paths = getPaths(path, shouldIgnoreCase);
	const {length} = paths;

	let index = 0;
	let value: ArrayOrPlainObject = data;

	while (index < length && value != null) {
		value = handleValue(
			value,
			paths[index++],
			null,
			true,
			shouldIgnoreCase,
		) as ArrayOrPlainObject;
	}

	return value as never;
}
