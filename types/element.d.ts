/**
 * - Find the parent element that matches the selector
 * - Matches may be found by a query string or a callback
 */
export declare function findParentElement(origin: Element, selector: string | ((element: Element) => boolean)): Element | undefined;
/**
 * - Get the most specific element under the pointer
 * - Ignores elements with `pointer-events: none` and `visibility: hidden`
 * - If `all` is `true`, all elements under the pointer are returned
 */
export declare function getElementUnderPointer(all?: boolean): Element | undefined;
