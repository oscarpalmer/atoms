import {getRandomInteger} from '../random';

// #region Functions

/**
 * Shuffle items in array
 * @param array Original array
 * @returns Shuffled array
 */
export function shuffle<Item>(array: Item[]): Item[] {
	if (!Array.isArray(array)) {
		return [];
	}

	const shuffled = [...array];

	if (shuffled.length < 2) {
		return shuffled;
	}

	let index = Number(shuffled.length);

	while (--index >= 0) {
		const random = getRandomInteger(0, index);

		[shuffled[index], shuffled[random]] = [shuffled[random], shuffled[index]];
	}

	return shuffled;
}

// #endregion
