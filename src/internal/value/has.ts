import type {NestedKeys, NestedValue, PlainObject, ToString} from '../../models';
import type {Result} from '../../result/models';
import {getNestedValue} from './misc';

// #region Functions

/**
 * Check if a property is defined in an object
 *
 * @param data Object to check in
 * @param path Path for property, e.g., `foo.bar.baz`
 * @returns `true` if the property exists, `false` otherwise
 *
 * @example
 * ```typescript
 * const data = {foo: {bar: {baz: 42}}};
 *
 * hasValue(data, 'foo');         // => true
 * hasValue(data, 'foo.bar');     // => true
 * hasValue(data, 'foo.bar.baz'); // => true
 * hasValue(data, 'foo.nope');    // => false
 * ```
 */
export function hasValue<Data extends PlainObject, Path extends NestedKeys<Data>>(
	data: Data,
	path: Path,
): boolean;

/**
 * Check if a property is defined in an object
 *
 * @param data Object to check in
 * @param path Path for property, e.g., `foo.bar.baz`
 * @param ignoreCase If `true`, the path matching is case-insensitive
 * @returns `true` if the property exists, `false` otherwise
 *
 * @example
 * ```typescript
 * const data = {foo: {bar: {baz: 42}}};
 *
 * hasValue(data, 'foo');               // => true
 * hasValue(data, 'foo.bar');           // => true
 * hasValue(data, 'Foo.Bar.Baz', true); // => true
 * hasValue(data, 'foo.nope');          // => false
 * ```
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
 * Check if a property is defined in an object, and get its value if it is
 *
 * _Available as `hasValueResult` and `hasValue.get`_
 *
 * @param data Object to check in
 * @param path Path for property, e.g., `foo.bar.baz`
 * @param ignoreCase If `true`, the path matching is case-insensitive
 * @returns Result object
 *
 * @example
 * ```typescript
 * const data = {foo: {bar: {baz: 42}}};
 *
 * hasValueResult(data, 'foo');         // => {ok: true, value: {bar: {baz: 42}}}
 * hasValueResult(data, 'foo.bar');     // => {ok: true, value: {baz: 42}}
 * hasValueResult(data, 'foo.bar.baz'); // => {ok: true, value: 42}
 * hasValueResult(data, 'foo.nope');    // => {ok: false, error: 'Expected property to exist in object'}
 * ```
 */
export function hasValueResult<Data extends PlainObject, Path extends NestedKeys<Data>>(
	data: Data,
	path: Path,
): Result<NestedValue<Data, ToString<Path>>, string>;

/**
 * Check if a property is defined in an object, and get its value if it is
 *
 * _Available as `hasValueResult` and `hasValue.get`_
 *
 * @param data Object to check in
 * @param path Path for property, e.g., `foo.bar.baz`
 * @param ignoreCase If `true`, the path matching is case-insensitive
 * @returns Result object
 *
 * @example
 * ```typescript
 * const data = {foo: {bar: {baz: 42}}};
 *
 * hasValueResult(data, 'foo');               // => {ok: true, value: {bar: {baz: 42}}}
 * hasValueResult(data, 'foo.bar');           // => {ok: true, value: {baz: 42}}
 * hasValueResult(data, 'Foo.Bar.Baz', true); // => {ok: true, value: 42}
 * hasValueResult(data, 'foo.nope');          // => {ok: false, error: 'Expected property to exist in object'}
 * ```
 */
export function hasValueResult<Data extends PlainObject>(
	data: Data,
	path: string,
	ignoreCase?: boolean,
): Result<unknown, string>;

export function hasValueResult(
	data: PlainObject,
	path: string,
	ignoreCase?: boolean,
): Result<unknown, string> {
	return getNestedValue(data, path, ignoreCase === true);
}

// #endregion
