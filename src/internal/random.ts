import {isNumber} from './is';

/**
 * Get a random floating-point number
 */
export function getRandomFloat(minimum?: number, maximum?: number): number {
	let max =
		isNumber(maximum) && maximum <= Number.MAX_SAFE_INTEGER
			? maximum
			: Number.MAX_SAFE_INTEGER;

	let min =
		isNumber(minimum) && minimum >= Number.MIN_SAFE_INTEGER
			? minimum
			: Number.MIN_SAFE_INTEGER;

	if (min === max) {
		return min;
	}

	if (min > max) {
		[min, max] = [max, min];
	}

	return Math.random() * (max - min) + min;
}

/**
 * Get a random integer
 */
export function getRandomInteger(minimum?: number, maximum?: number): number {
	return Math.floor(getRandomFloat(minimum, maximum));
}
