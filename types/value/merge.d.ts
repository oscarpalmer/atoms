import type { ArrayOrPlainObject } from '../models';
type MergeOptions = {
    /**
     * - Skip nullable values when merging arrays?
     * - E.g. `merge([1, 2, 3], [null, null, 99])` => `[1, 2, 99]`
     */
    skipNullable?: boolean;
};
/**
 * Merges multiple arrays or objects into a single one
 */
export declare function merge<Model extends ArrayOrPlainObject>(values: Model[], options?: Partial<MergeOptions>): Model;
export {};
