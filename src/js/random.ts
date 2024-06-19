/**
 * Returns a random boolean
 */
export function getRandomBoolean(): boolean {
	return Math.random() > 0.5;
}

/**
 * Returns a random string of characters with a specified length
 * - `selection` defaults to all lowercase letters in the English alphabet
 */
export function getRandomCharacters(
	length: number,
	selection?: string,
): string {
	if (length < 1) {
		return '';
	}

	const actualSelection =
		typeof selection === 'string' && selection.length > 0
			? selection
			: 'abcdefghijklmnopqrstuvwxyz';

	let characters = '';

	for (let index = 0; index < length; index += 1) {
		characters += actualSelection.charAt(
			getRandomInteger(0, actualSelection.length),
		);
	}

	return characters;
}

/**
 * Returns a random hexadecimal colour
 */
export function getRandomColour(): string {
	return `#${Array.from({length: 6}, getRandomHex).join('')}`;
}

/**
 * Returns a random date
 */
export function getRandomDate(earliest?: Date, latest?: Date): Date {
	const earliestTime = earliest?.getTime() ?? -8_640_000_000_000_000;
	const latestTime = latest?.getTime() ?? 8_640_000_000_000_000;

	return new Date(getRandomInteger(earliestTime, latestTime));
}

/**
 * Returns a random floating-point number
 */
export function getRandomFloat(min?: number, max?: number): number {
	const minimum = min ?? Number.MIN_SAFE_INTEGER;

	return Math.random() * ((max ?? Number.MAX_SAFE_INTEGER) - minimum) + minimum;
}

/**
 * Returns a random integer
 */
export function getRandomInteger(min?: number, max?: number): number {
	return Math.floor(getRandomFloat(min, max));
}

/**
 * Returns a random hexadecimal character
 */
export function getRandomHex(): string {
	return '0123456789ABCDEF'[getRandomInteger(0, 16)];
}
