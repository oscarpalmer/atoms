/**
 * Get a random floating-point number
 */
export function getRandomFloat(min?: number, max?: number): number {
	let maximum =
		typeof max === 'number' && max <= Number.MAX_SAFE_INTEGER
			? max
			: Number.MAX_SAFE_INTEGER;

	let minimum =
		typeof min === 'number' && min >= Number.MIN_SAFE_INTEGER
			? min
			: Number.MIN_SAFE_INTEGER;

	if (minimum === maximum) {
		return minimum;
	}

	if (minimum > maximum) {
		[minimum, maximum] = [maximum, minimum];
	}

	return Math.random() * (maximum - minimum) + minimum;
}

/**
 * Get a random integer
 */
export function getRandomInteger(min?: number, max?: number): number {
	return Math.floor(getRandomFloat(min, max));
}
