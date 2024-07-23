/**
 * - Finds the closest elements to the origin element that matches the selector
 * - Traverses up, down, and sideways in the _DOM_-tree
 */
export declare function closest(origin: Element, selector: string, context?: Document | Element): Element[];
