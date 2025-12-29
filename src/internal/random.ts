import {isNumber} from './is';

function _getRandomFloat(inclusive: boolean, minimum?: number, maximum?: number): number {
	let maxFloat =
		isNumber(maximum) && maximum <= Number.MAX_SAFE_INTEGER ? maximum : Number.MAX_SAFE_INTEGER;

	let minFloat =
		isNumber(minimum) && minimum >= Number.MIN_SAFE_INTEGER ? minimum : Number.MIN_SAFE_INTEGER;

	if (minFloat === maxFloat) {
		return minFloat;
	}

	if (minFloat > maxFloat) {
		[minFloat, maxFloat] = [maxFloat, minFloat];
	}

	return Math.random() * (maxFloat + (inclusive ? 1 : 0) - minFloat) + minFloat;
}

/**
 * Get a random floating-point number
 * @param minimum Minimum value
 * @param maximum Maximum value
 * @returns Random floating-point number
 */
export function getRandomFloat(minimum?: number, maximum?: number): number {
	return _getRandomFloat(false, minimum, maximum);
}

/**
 * Get a random integer
 * @param minimum Minimum value
 * @param maximum Maximum value
 * @returns Random integer
 */
export function getRandomInteger(minimum?: number, maximum?: number): number {
	return Math.floor(_getRandomFloat(true, minimum, maximum));
}
