import {shuffle} from './internal/array/shuffle';
import {getRandomInteger} from './internal/random';
import {join} from './internal/string';

const characters = 'abcdefghijklmnopqrstuvwxyz';

/**
 * Get a random boolean
 * @return Random boolean value
 */
export function getRandomBoolean(): boolean {
	return Math.random() > 0.5;
}

/**
 * Get a random string of characters with a specified length
 * @param length Length of the string to return
 * @param selection String of characters to select from _(defaults to lowercase English alphabet)_
 * @returns Random string of characters
 */
export function getRandomCharacters(
	length: number,
	selection?: string,
): string {
	if (typeof length !== 'number' || length <= 0) {
		return '';
	}

	const actual =
		typeof selection === 'string' && selection.length > 0
			? selection
			: characters;

	let result = '';

	for (let index = 0; index < length; index += 1) {
		result += actual.charAt(getRandomInteger(0, actual.length - 1));
	}

	return result;
}

/**
 * Get a random hexadecimal color
 * @returns Random hexadecimal color string in the format `#RRGGBB`
 */
export function getRandomColor(): string {
	return `#${join(Array.from({length: 6}, getRandomHex))}`;
}

/**
 * Get a random hexadecimal character
 * @returns Random hexadecimal character from `0-9` and `A-F`
 */
export function getRandomHex(): string {
	return '0123456789ABCDEF'[getRandomInteger(0, 15)];
}

/**
 * Get a random item from an array
 * @param array Array to get a random item from
 * @returns Random item from the array, or `undefined` if the array is empty
 */
export function getRandomItem<Value>(array: Value[]): Value | undefined {
	if (!Array.isArray(array) || array.length === 0) {
		return;
	}

	return array.length === 1
		? array[0]
		: array[getRandomInteger(0, array.length - 1)];
}

/**
 * Get an shuffled array
 * @param array Array to get random items from
 * @returns A shuffled version of the original array
 */
export function getRandomItems<Value>(array: Value[]): Value[];

/**
 * Get an amount of random items from an array
 * @param array Array to get random items from
 * @param amount Amount of items to return
 * @returns Array of random items from the original array
 */
export function getRandomItems<Value>(array: Value[], amount: number): Value[];

export function getRandomItems<Value>(
	array: Value[],
	amount?: number,
): Value[] {
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

export {getRandomFloat, getRandomInteger} from './internal/random';
