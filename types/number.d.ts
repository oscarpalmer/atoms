/**
 * Is the number between a minimum and maximum value?
 */
export declare function between(value: number, min: number, max: number): boolean;
/**
 * - Clamps a number between a minimum and maximum value
 * - If `loop` is `true`, when the value is less than the minimum, it will be clamped as the maximum, and vice versa
 */
export declare function clamp(value: number, min: number, max: number, loop?: boolean): number;
/**
 * - Gets the number value from an unknown value
 * - Returns `NaN` if the value is `undefined`, `null`, or cannot be parsed
 * - Based on Lodash :-)
 */
export declare function getNumber(value: unknown): number;
