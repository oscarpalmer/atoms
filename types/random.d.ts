/**
 * Returns a random boolean
 */
export declare function getRandomBoolean(): boolean;
/**
 * Returns a random string of characters with a specified length
 * - `selection` defaults to all lowercase letters in the English alphabet
 */
export declare function getRandomCharacters(length: number, selection?: string): string;
/**
 * Returns a random hexadecimal colour
 */
export declare function getRandomColour(): string;
/**
 * Returns a random date
 */
export declare function getRandomDate(earliest?: Date, latest?: Date): Date;
/**
 * Returns a random floating-point number
 */
export declare function getRandomFloat(min?: number, max?: number): number;
/**
 * Returns a random hexadecimal character
 */
export declare function getRandomHex(): string;
/**
 * Returns a random integer
 */
export declare function getRandomInteger(min?: number, max?: number): number;
/**
 * Returns a random item from an array
 */
export declare function getRandomItem<Value>(array: Value[]): Value;
/**
 * - Returns an amount of random items from an array
 * - If `amount` is not specified, a shuffled array will be returned instead
 */
export declare function getRandomItems<Value>(array: Value[], amount?: number): Value[];
