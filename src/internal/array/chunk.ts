/**
 * Chunk an array into smaller arrays
 * @param array Array to chunk
 * @param size Size of each chunk _(defaults to 5000)_
 * @returns Array of arrays
 */
export function chunk<Item>(array: Item[], size?: number): Item[][] {
	if (!Array.isArray(array)) {
		return [];
	}

	if (array.length === 0) {
		return [];
	}

	const {length} = array;

	const actualSize =
		typeof size === 'number' && size > 0 && size <= DEFAULT_SIZE ? size : DEFAULT_SIZE;

	if (length <= actualSize) {
		return [array];
	}

	const chunks: Item[][] = [];

	let index = 0;

	while (index < length) {
		chunks.push(array.slice(index, index + actualSize));

		index += actualSize;
	}

	return chunks;
}

//

const DEFAULT_SIZE = 5_000;
