import type { Get, Paths, PlainObject, ToString } from '../models';
/**
 * - Get the value from an object using a known path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - Returns `undefined` if the value is not found
 */
export declare function getValue<Data extends PlainObject, Path extends Paths<Data>>(data: Data, path: Path): Get<Data, ToString<Path>>;
/**
 * - Get the value from an object using an unknown path
 * - You can retrieve a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If `ignoreCase` is `true`, path matching will be case-insensitive
 * - Returns `undefined` if the value is not found
 */
export declare function getValue<Data extends PlainObject>(data: Data, path: string, ignoreCase?: boolean): unknown;
