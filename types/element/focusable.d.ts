type FocusableElement = HTMLElement | SVGElement;
type TabbableElement = FocusableElement;
/**
 * Get a list of focusable elements within a parent element
 */
export declare function getFocusableElements(parent: Element): FocusableElement[];
/**
 * Get a list of tabbable elements within a parent element
 */
export declare function getTabbableElements(parent: Element): TabbableElement[];
/**
 * Is the element focusable?
 */
export declare function isFocusableElement(element: Element): boolean;
/**
 * Is the element tabbable?
 */
export declare function isTabbableElement(element: Element): boolean;
export {};
