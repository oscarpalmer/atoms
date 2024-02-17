/**
 * Clamps a number between a minimum and maximum value
 */
export declare function clampNumber(value: number, min: number, max: number): number;
/**
 * - Gets the number value from an unknown value
 * - Returns `NaN` if the value is `undefined`, `null`, or cannot be parsed
 * - Based on Lodash :-)
 */
export declare function getNumber(value: unknown): number;
