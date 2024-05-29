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
 * Get the sum of a list of numbers
 */
export function sum(values: number[]): number {
	return values.reduce((a, b) => a + b, 0);
}
