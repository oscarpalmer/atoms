import type {ArrayOrPlainObject, Get, Paths, ToString} from '../../models';
import {getPaths, handleValue} from './misc';

/**
 * Get the value from an object using a known path
 * @param data Object to retrieve the value from
 * @param path Path to the value, e.g., `foo.bar.baz`
 * @returns Value at the specified path, or `undefined` if not found
 */
export function getValue<
	Data extends ArrayOrPlainObject,
	Path extends Paths<Data>,
>(data: Data, path: Path): Get<Data, ToString<Path>>;

/**
 * Get the value from an object using an unknown path
 * @param data Object to retrieve the value from
 * @param path Path to the value, e.g., `foo.bar.baz`
 * @param ignoreCase If `true`, the path matching is case-insensitive
 * @returns Value at the specified path, or `undefined` if not found
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

	if (typeof paths === 'string') {
		return handleValue(data, paths, null, true, shouldIgnoreCase);
	}

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
