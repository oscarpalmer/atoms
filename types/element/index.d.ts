type TextDirection = 'ltr' | 'rtl';
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
export * from './data';
export * from './find';
export * from './style';
