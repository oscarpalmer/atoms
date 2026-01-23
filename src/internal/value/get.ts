import type {NestedKeys, NestedValue, PlainObject, ToString} from '../../models';
import {getPaths, handleValue} from './misc';

// #region Functions

/**
 * Get the value from an object using a known path
 * @param data Object to get value from
 * @param path Path for value, e.g., `foo.bar.baz`
 * @returns Found value, or `undefined`
 */
export function getValue<Data extends PlainObject, Path extends NestedKeys<Data>>(
	data: Data,
	path: Path,
): NestedValue<Data, ToString<Path>>;

/**
 * Get the value from an object using an unknown path
 * @param data Object to get value from
 * @param path Path for value, e.g., `foo.bar.baz`
 * @param ignoreCase If `true`, the path matching is case-insensitive
 * @returns Found value, or `undefined`
 */
export function getValue<Data extends PlainObject>(
	data: Data,
	path: string,
	ignoreCase?: boolean,
): unknown;

export function getValue(data: PlainObject, path: string, ignoreCase?: boolean): unknown {
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
	let value: PlainObject = data;

	while (index < length && value != null) {
		value = handleValue(value, paths[index++], null, true, shouldIgnoreCase) as PlainObject;
	}

	return value as never;
}

// #endregion
