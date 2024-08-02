import { type SanitiseOptions } from './sanitise';
/**
 * - Create nodes from a string of HTML or a template element
 * - If `value` doesn't contain any whitespace, it will be treated as an ID before falling back to being treated as HTML
 * - If `sanitisation` is not provided, `true`, or an object, bad markup will be sanitised or removed
 * - Regardless of the value of `sanitisation`, scripts will always be removed
 */
export declare function html(value: string, sanitisation?: boolean | SanitiseOptions): Node[];
/**
 * - Create nodes from a template element
 * - If `sanitisation` is not provided, `true`, or an object, bad markup will be sanitised or removed
 * - Regardless of the value of `sanitisation`, scripts will always be removed
 */
export declare function html(value: HTMLTemplateElement, sanitisation?: boolean | SanitiseOptions): Node[];
export * from './sanitise';
