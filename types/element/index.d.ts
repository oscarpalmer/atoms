type Selector = string | Element | Element[] | NodeList;
type TextDirection = 'ltr' | 'rtl';
/**
 * - Find the first element that matches the selector
 * - `context` is optional and defaults to `document`
 */
export declare function findElement(selector: Selector, context?: Selector): Element | undefined;
/**
 * - Find elements that match the selector
 * - `context` is optional and defaults to `document`
 */
export declare function findElements(selector: Selector, context?: Selector): Element[];
/**
 * - Find the parent element that matches the selector
 * - Matches may be found by a query string or a callback
 * - If no match is found, `undefined` is returned
 */
export declare function findParentElement(origin: Element, selector: string | ((element: Element) => boolean)): Element | undefined;
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
export { findElement as $, findElements as $$ } from '.';
