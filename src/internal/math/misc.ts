// #region Functions

import {
	MATH_EXPONENT_PREFIX,
	MATH_EXPRESSION_ROUNDING,
	MATH_ROUNDING_DECIMALS_MAX,
	MATH_ROUNDING_TOLERANCE,
} from '../../models/math.model';

/**
 * Round a number down
 *
 * @param value Number to round down
 * @param decimals Number of decimal places to round to _(defaults to `0`)_
 * @returns Rounded number, or `Number.NaN` if the value is unable to be rounded
 *
 * @example
 * ```typescript
 * floor(10.567, 2); // => 10.56
 * floor(10.567);    // => 10
 * floor('abc');     // => Number.NaN
 * ```
 */
export function floor(value: number, decimals?: number): number {
	return roundNumber(Math.floor, value, decimals);
}

/**
 * Round a number
 *
 * @param value Number to round
 * @param decimals Number of decimal places to round to _(defaults to `0`)_
 * @returns Rounded number, or `Number.NaN` if the value is unable to be rounded
 *
 * @example
 * ```typescript
 * round(10.567, 2); // => 10.57
 * round(10.567);    // => 11
 * round('abc');     // => Number.NaN
 * ```
 */
export function round(value: number, decimals?: number): number {
	return roundNumber(Math.round, value, decimals);
}

export function roundNumber(
	callback: (value: number) => number,
	value: number,
	decimals?: number,
): number {
	if (typeof value !== 'number' || Number.isNaN(value)) {
		return Number.NaN;
	}

	if (
		!Number.isFinite(value) ||
		typeof decimals !== 'number' ||
		!Number.isFinite(decimals) ||
		decimals < 1
	) {
		return callback(value);
	}

	decimals = Math.floor(decimals);

	if (decimals > MATH_ROUNDING_DECIMALS_MAX) {
		return shiftDecimals(callback(shiftDecimals(value, decimals)), -decimals);
	}

	const mod = 10 ** decimals;
	const scaled = value * mod;

	const fraction = scaled - Math.floor(scaled);
	const tolerance = Math.abs(scaled) * MATH_ROUNDING_TOLERANCE;

	// Far from a rounding boundary (integer or half), so floating point error can't change the result
	if (fraction > tolerance && fraction < 1 - tolerance && Math.abs(fraction - 0.5) > tolerance) {
		return callback(scaled) / mod;
	}

	return callback(shiftDecimals(value, decimals)) / mod;
}

function shiftDecimals(value: number, places: number): number {
	const asString = String(value);

	if (!asString.includes(MATH_EXPONENT_PREFIX)) {
		return Number(`${asString}e${places}`);
	}

	const [, base, exponent] = MATH_EXPRESSION_ROUNDING.exec(asString) as RegExpExecArray;

	return Number(`${base}e${Number.parseInt(exponent, 10) + places}`);
}

// #endregion
