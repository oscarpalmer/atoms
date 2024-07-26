import type {ToString} from 'type-fest/source/internal/string';
import {handleValue} from '../internal/value-handle';
import type {Get, Paths, PlainObject} from '../models';

/**
 * - Get the value from an object using a known path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - Returns `undefined` if the value is not found
 */
export function getValue<Data extends PlainObject, Path extends Paths<Data>>(
	data: Data,
	path: Path,
): Get<Data, ToString<Path>>;

/**
 * - Get the value from an object using an unknown path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If `ignoreCase` is `true`, path matching will be case-insensitive
 * - Returns `undefined` if the value is not found
 */
export function getValue<Data extends PlainObject>(
	data: Data,
	path: string,
	ignoreCase?: boolean,
): unknown;

export function getValue(
	data: PlainObject,
	path: string,
	ignoreCase?: boolean,
): unknown {
	const shouldIgnoreCase = ignoreCase === true;
	const parts = (shouldIgnoreCase ? path.toLowerCase() : path).split('.');
	const {length} = parts;

	let index = 0;
	let value = typeof data === 'object' ? data ?? {} : {};

	while (index < length && value != null) {
		value = handleValue(
			value,
			parts[index++],
			null,
			true,
			shouldIgnoreCase,
		) as PlainObject;
	}

	return value as never;
}
