// #region Functions

/**
 * Chunk an array into smaller arrays
 * @param array Array to chunk
 * @param size Size of each chunk _(minimum is `1`, maximum is `5000`; defaults to `5000`)_
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

	const actualSize = typeof size === 'number' && size > 0 && size <= MAX_SIZE ? size : MAX_SIZE;

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

// #endregion

// #region Constants

const MAX_SIZE = 5_000;

// #endregion
