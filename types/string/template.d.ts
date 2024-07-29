import type { PlainObject } from '../models';
type Options = {
    /**
     * Ignore case when searching for variables?
     */
    ignoreCase?: boolean;
    /**
     * Custom pattern for outputting variables
     */
    pattern?: RegExp;
};
export declare function template(value: string, variables: PlainObject, options?: Partial<Options>): string;
export {};
