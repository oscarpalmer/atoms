import type { ArrayOrPlainObject } from '../models';
/**
 * Merges multiple arrays or objects into a single one
 */
export declare function merge<Model extends ArrayOrPlainObject>(...values: Model[]): Model;
