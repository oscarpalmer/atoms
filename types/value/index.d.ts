import type { PlainObject } from '../models';
/**
 * Creates a new object with only the specified keys
 */
export declare function partial<Value extends PlainObject, Key extends keyof Value>(value: Value, keys: Key[]): Pick<Value, Key>;
export * from './clone';
export * from './compare';
export * from './diff';
export * from './equal';
export * from './get';
export * from './merge';
export * from './set';
export * from './smush';
export * from './unsmush';
