import type {NestedKeys, NestedValue, PlainObject, ToString} from '../../models';
import type {Result} from '../../result/models';
import {getNestedValue} from './misc';

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
	return getNestedValue(data, path, ignoreCase === true).ok;
}

hasValue.get = hasValueResult;

/**
 * Check if a nested property is defined in an object, and get its value if it is
 *
 * Available as `hasValueResult` and `hasValue.get`
 * @param data Object to check in
 * @param path Path for property
 * @param ignoreCase If `true`, the path matching is case-insensitive
 * @return Result object
 */
function hasValueResult<Data extends PlainObject, Path extends NestedKeys<Data>>(
	data: Data,
	path: Path,
	ignoreCase?: boolean,
): Result<NestedValue<Data, ToString<Path>>, undefined>;

/**
 * Check if a nested property is defined in an object, and get its value if it is
 *
 * Available as `hasValueResult` and `hasValue.get`
 * @param data Object to check in
 * @param path Path for property
 * @param ignoreCase If `true`, the path matching is case-insensitive
 * @return Result object
 */
function hasValueResult<Data extends PlainObject>(
	data: Data,
	path: string,
	ignoreCase?: boolean,
): Result<unknown, undefined>;

function hasValueResult(
	data: PlainObject,
	path: string,
	ignoreCase?: boolean,
): Result<unknown, undefined> {
	return getNestedValue(data, path, ignoreCase === true);
}

// #endregion
