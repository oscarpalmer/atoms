/**
 * Get the average value from a list of numbers
 */
export function average(values: number[]): number {
	return values.length > 0 ? sum(values) / values.length : Number.NaN;
}

/**
 * Get the maximum value from a list of numbers
 */
export function max(values: number[]): number {
	return values.length > 0 ? Math.max(...values) : Number.NaN;
}

/**
 * Get the minimum value from a list of numbers
 */
export function min(values: number[]): number {
	return values.length > 0 ? Math.min(...values) : Number.NaN;
}

/**
 * Round a number to a specific number of decimal places _(defaults to 0)_
 */
export function round(value: number, decimals?: number): number {
	if (typeof decimals !== 'number' || decimals < 1) {
		return Math.round(value);
	}

	const mod = 10 ** decimals;

	return Math.round((value + Number.EPSILON) * mod) / mod;
}

/**
 * Get the sum of a list of numbers
 */
export function sum(values: number[]): number {
	return values.reduce((previous, current) => previous + current, 0);
}
