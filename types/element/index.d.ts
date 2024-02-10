type TextDirection = 'ltr' | 'rtl';
/**
 * - Find the parent element that matches the selector
 * - Matches may be found by a query string or a callback
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
export {};
