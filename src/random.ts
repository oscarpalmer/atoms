import {shuffle} from './array/shuffle';

const characters = 'abcdefghijklmnopqrstuvwxyz';

/**
 * Get a random boolean
 */
export function getRandomBoolean(): boolean {
	return Math.random() > 0.5;
}

/**
 * Get a random string of characters with a specified length
 * - `selection` defaults to all lowercase letters in the English alphabet
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
 */
export function getRandomColor(): string {
	return `#${Array.from({length: 6}, getRandomHex).join('')}`;
}

/**
 * Get a random floating-point number
 */
export function getRandomFloat(min?: number, max?: number): number {
	let maximum =
		typeof max === 'number' && max <= Number.MAX_SAFE_INTEGER
			? max
			: Number.MAX_SAFE_INTEGER;

	let minimum =
		typeof min === 'number' && min >= Number.MIN_SAFE_INTEGER
			? min
			: Number.MIN_SAFE_INTEGER;

	if (minimum === maximum) {
		return minimum;
	}

	if (minimum > maximum) {
		[minimum, maximum] = [maximum, minimum];
	}

	return Math.random() * (maximum - minimum) + minimum;
}

/**
 * Get a random hexadecimal character
 */
export function getRandomHex(): string {
	return '0123456789ABCDEF'[getRandomInteger(0, 16)];
}

/**
 * Get a random integer
 */
export function getRandomInteger(min?: number, max?: number): number {
	return Math.floor(getRandomFloat(min, max));
}

/**
 * Get a random item from an array
 */
export function getRandomItem<Value>(array: Value[]): Value | undefined {
	return array.length === 0
		? undefined
		: array.length === 1
			? array[0]
			: array[getRandomInteger(0, array.length - 1)];
}

/**
 * - Get an amount of random items from an array
 * - If `amount` is not specified, a shuffled array will be returned instead
 */
export function getRandomItems<Value>(
	array: Value[],
	amount?: number,
): Value[] {
	if (array.length === 0 || amount === 0) {
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
