import {shuffle} from './internal/array/shuffle';
import {getRandomInteger} from './internal/random';
import {join} from './internal/string';

// #region Functions

/**
 * Get a random boolean
 * @return Random boolean
 */
export function getRandomBoolean(): boolean {
	return Math.random() > BOOLEAN_MODIFIER;
}

/**
 * Get a random string of characters with a specified length
 * @param length Length of random string
 * @param selection String of characters to select from _(defaults to lowercase English alphabet)_
 * @returns Random string of characters
 */
export function getRandomCharacters(length: number, selection?: string): string {
	if (typeof length !== 'number' || length <= 0) {
		return '';
	}

	const actual = typeof selection === 'string' && selection.length > 0 ? selection : ALPHABET;

	let characters = '';

	for (let index = 0; index < length; index += 1) {
		characters += actual.charAt(getRandomInteger(0, actual.length - 1));
	}

	return characters;
}

/**
 * Get a random hexadecimal color
 * @param prefix Prefix the color with `#`? _(defaults to `false`)_
 * @returns Random hexadecimal color string in the format `(#)RRGGBB`
 */
export function getRandomColor(prefix?: boolean): string {
	return `${prefix === true ? '#' : ''}${join(Array.from({length: 6}, getRandomHex))}`;
}

/**
 * Get a random hexadecimal character
 * @returns Random hexadecimal character from `0-9` and `A-F`
 */
export function getRandomHex(): string {
	return HEX_CHARACTERS[getRandomInteger(0, HEX_MAXIMUM)];
}

/**
 * Get a random item from an array
 * @param array Array to get a random item from
 * @returns Random item from the array, or `undefined` if unable to retrieve one
 */
export function getRandomItem<Value>(array: Value[]): Value | undefined {
	if (!Array.isArray(array) || array.length === 0) {
		return;
	}

	return array.length === 1 ? array[0] : array[getRandomInteger(0, array.length - 1)];
}

/**
 * Get an amount of random items from an array
 * @param array Array to get random items from
 * @param amount Amount of items to return
 * @returns Array of random items
 */
export function getRandomItems<Value>(array: Value[], amount: number): Value[];

/**
 * Get an shuffled array
 * @param array Array to get random items from
 * @returns A shuffled version of the original array
 */
export function getRandomItems<Value>(array: Value[]): Value[];

export function getRandomItems<Value>(array: Value[], amount?: number): Value[] {
	if (!Array.isArray(array) || array.length === 0 || amount === 0) {
		return [];
	}

	if (array.length < 2) {
		return array;
	}

	if (amount === 1) {
		return [array[getRandomInteger(0, array.length - 1)]];
	}

	return typeof amount !== 'number' || amount <= 0 || amount >= array.length
		? shuffle(array)
		: shuffle(array).slice(0, amount);
}

// #endregion

// #region Constants

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

const BOOLEAN_MODIFIER = 0.5;

const HEX_CHARACTERS = '0123456789ABCDEF';

const HEX_MAXIMUM = 15;

// #endregion

// #region Exports

export {getRandomFloat, getRandomInteger} from './internal/random';

// #endregion
