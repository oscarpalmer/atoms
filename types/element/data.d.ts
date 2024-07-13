import type { PlainObject } from '../models';
/**
 * Get data values from an element as an object
 */
export declare function getData<Value extends PlainObject>(element: HTMLElement, keys: string[]): Value;
/**
 * Get a data value from an element
 */
export declare function getData(element: HTMLElement, key: string): unknown;
/**
 * Set data values on an element
 */
export declare function setData(element: HTMLElement, data: PlainObject): void;
/**
 * Set a data values on an element
 */
export declare function setData(element: HTMLElement, key: string, value: unknown): void;
