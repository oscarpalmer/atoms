import {clamp} from '~/number';

/**
 * Chunk an array _(into smaller arrays of a specified size)_
 */
export function chunk<Item>(array: Item[], size?: number): Item[][] {
	const chunkSize = clamp(size ?? 64_000, 1, 64_000);
	const {length} = array;

	if (length <= chunkSize) {
		return [array];
	}

	const chunks: Item[][] = [];

	let remaining = Number(length);

	while (remaining > 0) {
		chunks.push(array.splice(0, chunkSize));

		remaining -= chunkSize;
	}

	return chunks;
}
