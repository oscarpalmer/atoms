/**
 * Chunks an array into smaller arrays of a specified size
 */
export function chunk<Value>(array: Value[], size?: number): Value[][] {
	const {length} = array;

	const chunkSize = typeof size === 'number' && size > 0 ? size : 64_000;

	if (length <= chunkSize) {
		return [array];
	}

	const chunks: Value[][] = [];

	let remaining = Number(length);

	while (remaining > 0) {
		chunks.push(array.splice(0, chunkSize));

		remaining -= chunkSize;
	}

	return chunks;
}
