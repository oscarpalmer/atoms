/**
 * Round a number
 *
 * @param value Number to round
 * @param decimals Number of decimal places to round to _(defaults to `0`)_
 * @returns Rounded number, or `Number.NaN` if the value if unable to be rounded
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
