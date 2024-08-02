/**
 * List of boolean attributes
 */
export declare const booleanAttributes: readonly string[];
/**
 * Is the attribute considered bad and potentially harmful?
 */
export declare function isBadAttribute(name: string, value: string): boolean;
/**
 * Is the attribute a boolean attribute?
 */
export declare function isBooleanAttribute(name: string): boolean;
/**
 * Is the attribute empty and not a boolean attribute?
 */
export declare function isEmptyNonBooleanAttribute(name: string, value: string): boolean;
/**
 * - Is the attribute an invalid boolean attribute?
 * - I.e., its value is not empty or the same as its name?
 */
export declare function isInvalidBooleanAttribute(name: string, value: string): boolean;
/**
 * - Sets an attribute for an element
 * - If the value is nullable, the attribute is removed
 */
export declare function setAttribute(element: Element, name: string, value: unknown): void;
