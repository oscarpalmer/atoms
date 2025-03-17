import {getRandomInteger} from '../random';

/**
 * Shuffle an array
 */
export function shuffle<Item>(array: Item[]): Item[] {
	if (!Array.isArray(array)) {
		return [];
	}

	if (array.length < 2) {
		return array;
	}

	const shuffled = array.slice();

	let index = Number(shuffled.length);

	while (--index >= 0) {
		const random = getRandomInteger(0, index);

		[shuffled[index], shuffled[random]] = [shuffled[random], shuffled[index]];
	}

	return shuffled;
}
