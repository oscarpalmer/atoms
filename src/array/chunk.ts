/**
 * Chunk an array _(into smaller arrays)_, with an optional size _(default and maximum is 5000)_.
 */
export function chunk<Item>(array: Item[], size?: number): Item[][] {
	if (!Array.isArray(array)) {
		return [];
	}

	if (array.length === 0) {
		return [];
	}

	const actualSize =
		typeof size === 'number' && size > 0 && size <= 5_000 ? size : 5_000;

	const {length} = array;

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
