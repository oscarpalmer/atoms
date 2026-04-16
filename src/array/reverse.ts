export function reverse<Item>(array: Item[]): Item[] {
	if (!Array.isArray(array)) {
		return [];
	}

	const {length} = array;

	if (length < 2) {
		return array;
	}

	const half = Math.floor(length / 2);

	for (let firstIndex = 0; firstIndex < half; firstIndex += 1) {
		const temporaryItem = array[firstIndex];
		const secondIndex = length - 1 - firstIndex;

		array[firstIndex] = array[secondIndex];
		array[secondIndex] = temporaryItem;
	}

	return array;
}
