import {getRandomInteger} from '../random';

/**
 * Shuffle an array
 */
export function shuffle<Item>(array: Item[]): Item[] {
	const shuffled = array.slice();
	const {length} = shuffled;

	for (let index = 0; index < length; index += 1) {
		const random = getRandomInteger(0, length);

		[shuffled[index], shuffled[random]] = [shuffled[random], shuffled[index]];
	}

	return shuffled;
}
