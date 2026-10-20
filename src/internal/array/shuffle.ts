import {getRandomInteger} from '../random';

// #region Functions

/**
 * Shuffle items in array
 *
 * @param array Original array
 * @returns Shuffled array
 *
 * @example
 * ```typescript
 * shuffle([1, 2, 3]); // => [3, 1, 2] (maybe? it's random, you know)
 * ```
 */
export function shuffle<Item>(array: Item[]): Item[] {
	if (!Array.isArray(array)) {
		return [];
	}

	const shuffled = array.slice();

	if (shuffled.length < 2) {
		return shuffled;
	}

	let index = shuffled.length;

	while (--index >= 0) {
		const random = getRandomInteger(0, index);

		[shuffled[index], shuffled[random]] = [shuffled[random], shuffled[index]];
	}

	return shuffled;
}

// #endregion
