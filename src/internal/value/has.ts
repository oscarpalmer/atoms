import type {NestedKeys, NestedValue, PlainObject, ToString} from '../../models';
import {getNestedValue} from './misc';

// #region Types

export type HasValue<Value> = {
	exists: boolean;
	value: Value;
};

// #endregion

// #region Functions

/**
 * Check if a nested property is defined in an object
 * @param data Object to check in
 * @param path Path for property
 * @return `true` if the property exists, `false` otherwise
 */
export function hasValue<Data extends PlainObject, Path extends NestedKeys<Data>>(
	data: Data,
	path: Path,
): boolean;

/**
 * Check if a nested property is defined in an object
 * @param data Object to check in
 * @param path Path for property
 * @param ignoreCase If `true`, the path matching is case-insensitive
 * @return `true` if the property exists, `false` otherwise
 */
export function hasValue<Data extends PlainObject>(
	data: Data,
	path: string,
	ignoreCase?: boolean,
): boolean;

export function hasValue(data: PlainObject, path: string, ignoreCase?: boolean): boolean {
	return getNestedValue(data, path, ignoreCase === true).exists;
}

hasValue.get = getWithHasValue;

/**
 * Check if a nested property is defined in an object, and get its value if it is
 * @param data Object to check in
 * @param path Path for property
 * @param ignoreCase If `true`, the path matching is case-insensitive
 * @return Result object
 */
function getWithHasValue<Data extends PlainObject, Path extends NestedKeys<Data>>(
	data: Data,
	path: Path,
	ignoreCase?: boolean,
): HasValue<NestedValue<Data, ToString<Path>>>;

/**
 * Check if a nested property is defined in an object, and get its value if it is
 * @param data Object to check in
 * @param path Path for property
 * @param ignoreCase If `true`, the path matching is case-insensitive
 * @return Result object
 */
function getWithHasValue<Data extends PlainObject>(
	data: Data,
	path: string,
	ignoreCase?: boolean,
): HasValue<unknown>;

function getWithHasValue(data: PlainObject, path: string, ignoreCase?: boolean): HasValue<unknown> {
	return getNestedValue(data, path, ignoreCase === true);
}

// #endregion
