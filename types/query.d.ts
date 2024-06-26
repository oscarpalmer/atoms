import type { PlainObject } from './models';
/**
 * Converts a query string to a plain _(nested)_ object
 */
export declare function fromQuery(query: string): PlainObject;
/**
 * Converts a plain _(nested)_ object to a query string
 */
export declare function toQuery(parameters: PlainObject): string;
