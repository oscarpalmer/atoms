type Selector = string | Document | Element | Element[] | NodeList;
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
 * - If no match is found, `null` is returned
 */
export declare function findParentElement(origin: Element, selector: string | ((element: Element) => boolean)): Element | null;
export { findElement as $, findElements as $$ };
