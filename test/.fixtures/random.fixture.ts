async function getRandomNumber(
	callback: (min?: number, max?: number) => number,
	handle: (value: unknown) => void,
	flipped: boolean,
	min?: number,
	max?: number,
): Promise<void> {
	let maxActual: number;
	let minActual: number;

	if (typeof max === 'number') {
		maxActual = max;
	} else {
		maxActual = flipped ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
	}

	if (typeof min === 'number') {
		minActual = min;
	} else {
		minActual = flipped ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
	}

	let index = 0;
	let invalid = 0;

	for (; index < size; index += 1) {
		const value = callback(min, max);

		if (
			value > (flipped ? minActual : maxActual) + 1 ||
			value < (flipped ? maxActual : minActual)
		) {
			invalid += 1;
		}
	}

	handle(invalid);
}

const size = 100_000;

export const randomFixture = {
	getRandomNumber,
	size,
};
