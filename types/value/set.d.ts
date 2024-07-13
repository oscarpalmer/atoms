import type { Paths, PlainObject } from '../models';
/**
 * - Set the value in an object using a known path
 * - You can set a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If a part of the path does not exist, it will be created, either as an array or a generic object, depending on the path
 * - Returns the original object
 */
export declare function setValue<Data extends PlainObject, Path extends Paths<Data>>(data: Data, path: Path, value: unknown): Data;
/**
 * - Set the value in an object using an unknown path
 * - You can set a nested value by using dot notation, e.g., `foo.bar.baz`
 * - If a part of the path does not exist, it will be created, either as an array or a generic object, depending on the path
 * - If `ignoreCase` is `true`, path matching will be case-insensitive
 * - Returns the original object
 */
export declare function setValue<Data extends PlainObject>(data: Data, path: string, value: unknown, ignoreCase?: boolean): Data;
