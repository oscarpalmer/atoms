// #region Functions

/**
 * Round a number down
 *
 * @param value Number to round down
 * @param decimals Number of decimal places to round to _(defaults to `0`)_
 * @returns Rounded number, or `Number.NaN` if the value if unable to be rounded
 *
 * @example
 * ```typescript
 * floor(10.567, 2); // => 10.56
 * floor(10.567);    // => 10
 * floor('abc');       // => Number.NaN
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
 * @returns Rounded number, or `Number.NaN` if the value if unable to be rounded
 *
 * @example
 * ```typescript
 * round(10.567, 2); // => 10.57
 * round(10.567);    // => 11
 * round('abc');       // => Number.NaN
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
	if (typeof value !== 'number') {
		return Number.NaN;
	}

	if (typeof decimals !== 'number' || decimals < 1) {
		return callback(value);
	}

	const mod = 10 ** decimals;

	return callback((value + Number.EPSILON) * mod) / mod;
}

// #endregion
