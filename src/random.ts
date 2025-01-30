import {shuffle} from './array/shuffle';

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
	if (length < 1) {
		return '';
	}

	const actual =
		typeof selection === 'string' && selection.length > 0
			? selection
			: 'abcdefghijklmnopqrstuvwxyz';

	let characters = '';

	for (let index = 0; index < length; index += 1) {
		characters += actual.charAt(getRandomInteger(0, actual.length));
	}

	return characters;
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
	const minimum = min ?? Number.MIN_SAFE_INTEGER;

	return Math.random() * ((max ?? Number.MAX_SAFE_INTEGER) - minimum) + minimum;
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
export function getRandomItem<Value>(array: Value[]): Value {
	return array[getRandomInteger(0, array.length)];
}

/**
 * - Get an amount of random items from an array
 * - If `amount` is not specified, a shuffled array will be returned instead
 */
export function getRandomItems<Value>(
	array: Value[],
	amount?: number,
): Value[] {
	if (amount === 1) {
		return array.length === 0 ? [] : [array[getRandomInteger(0, array.length)]];
	}

	return amount == null || amount >= array.length
		? shuffle(array)
		: shuffle(array).slice(0, amount);
}
