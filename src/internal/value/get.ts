import type {NestedKeys, NestedValue, PlainObject} from '../../models';
import type {Ok} from '../../result/models';
import {getNestedValue} from './misc';

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
): NestedValue<Data, Path>;

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
	return (getNestedValue(data, path, ignoreCase === true) as Ok<unknown>).value;
}

// #endregion
