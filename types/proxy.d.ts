import { type ArrayOrPlainObject, type PlainObject } from './is';
export type Subscriber<T1 = unknown, T2 = T1> = (to: T1, from: T2) => void;
/**
 * Clones and creates a new proxy
 */
export declare function cloneProxy<T extends ArrayOrPlainObject>(proxy: T): T;
/**
 * Creates a proxy for an array or object
 */
export declare function proxy<T extends PlainObject>(value: T): T;
/**
 * Subscribes to changes for a key in a proxy
 */
export declare function subscribe<T1 = ArrayOrPlainObject, T2 = unknown, T3 = T2>(proxy: T1, key: string, subscriber: Subscriber<T2, T3>): void;
/**
 * Unsubscribes from changes for a key in a proxy
 */
export declare function unsubscribe<T1 = ArrayOrPlainObject, T2 = unknown, T3 = T2>(proxy: T1, key: string, subscriber: Subscriber<T2, T3>): void;
