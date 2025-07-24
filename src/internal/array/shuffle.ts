import {getRandomInteger} from '../random';

/**
 * Shuffle items in array
 * @param array Array to shuffle
 * @returns New array with shuffled values
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
