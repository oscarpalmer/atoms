/**
 * Chunk an array _(into smaller arrays)_
 */
export function chunk<Item>(array: Item[]): Item[][] {
	const {length} = array;

	if (length <= 5_000) {
		return [array];
	}

	const chunks: Item[][] = [];

	let index = 0;

	while (index < length) {
		chunks.push(array.slice(index, index + 5_000));

		index += 5_000;
	}

	return chunks;
}
