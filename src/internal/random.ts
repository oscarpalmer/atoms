import {isNumber} from './is';
import {floor} from './math/misc';

// #region Functions

/**
 * Get a random number between 0 _(inclusive)_ and 1 _(exclusive)_
 *
 * @returns Random number
 */
export function getRandom(): number {
	/* istanbul ignore if */
	if (globalThis.crypto == null) {
		return Math.random();
	}

	return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / RANDOM_DIVISOR;
}

function getRandomFloatingNumberValue(
	inclusive: boolean,
	minimum?: number,
	maximum?: number,
): number {
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

	return getRandom() * (maxFloat + (inclusive ? 1 : 0) - minFloat) + minFloat;
}

/**
 * Get a random floating-point number
 *
 * @param minimum Minimum value
 * @param maximum Maximum value
 * @returns Random floating-point number
 */
export function getRandomFloatingNumber(minimum?: number, maximum?: number): number {
	return getRandomFloatingNumberValue(false, minimum, maximum);
}

/**
 * Get a random integer
 *
 * @param minimum Minimum value
 * @param maximum Maximum value
 * @returns Random integer
 */
export function getRandomInteger(minimum?: number, maximum?: number): number {
	return floor(getRandomFloatingNumberValue(true, minimum, maximum));
}

// #endregion

// #region Variables

const RANDOM_DIVISOR = 2 ** 32;

// #endregion
