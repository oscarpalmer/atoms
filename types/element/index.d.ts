import type { PlainObject } from '../models';
type Selector = string | Document | Element | Element[] | NodeList;
type TextDirection = 'ltr' | 'rtl';
/**
 * - Find the first element that matches the selector
 * - `context` is optional and defaults to `document`
 */
export declare function findElement(selector: string, context?: Selector): Element | undefined;
/**
 * - Find elements that match the selector
 * - If `selector` is a node or a list of nodes, they are filtered and returned
 * - `context` is optional and defaults to `document`
 */
export declare function findElements(selector: Selector, context?: Selector): Element[];
/**
 * - Find the parent element that matches the selector
 * - Matches may be found by a query string or a callback
 * - If no match is found, `undefined` is returned
 */
export declare function findParentElement(origin: Element, selector: string | ((element: Element) => boolean)): Element | null;
/**
 * Get data values from an element as an object
 */
export declare function getData<Value extends PlainObject>(element: HTMLElement, keys: string[]): Value;
/**
 * Get a data value from an element
 */
export declare function getData(element: HTMLElement, key: string): unknown;
/**
 * - Get the most specific element under the pointer
 * - Ignores elements with `pointer-events: none` and `visibility: hidden`
 * - If `skipIgnore` is `true`, no elements are ignored
 */
export declare function getElementUnderPointer(skipIgnore?: boolean): Element | undefined;
/**
 * Get the text direction of an element
 */
export declare function getTextDirection(element: Element): TextDirection;
/**
 * Set data values on an element
 */
export declare function setData(element: HTMLElement, data: PlainObject): void;
/**
 * Set a data values on an element
 */
export declare function setData(element: HTMLElement, key: string, value: unknown): void;
/**
 * Set styles on an element
 */
export declare function setStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void;
/**
 * Set a style on an element
 */
export declare function setStyles(element: HTMLElement, key: keyof CSSStyleDeclaration, value?: string): void;
export { findElement as $, findElements as $$ };
