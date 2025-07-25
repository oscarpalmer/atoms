/**
 * Compact an array _(removing all `null` and `undefined` values)_
 * @param array Array to compact
 * @returns Compacted array
 */
export function compact<Item>(array: Item[]): Exclude<Item, null | undefined>[];

/**
 * Compact an array _(removing all false-y values)_
 * @param array Array to compact
 * @returns Compacted array
 */
export function compact<Item>(
	array: Item[],
	strict: true,
): Exclude<Item, 0 | '' | false | null | undefined>[];

export function compact<Item>(array: Item[], strict?: boolean): Item[] {
	if (!Array.isArray(array)) {
		return [];
	}

	const isStrict = strict ?? false;
	const {length} = array;
	const compacted: Item[] = [];

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		if ((isStrict && !!item) || (!isStrict && item != null)) {
			compacted.push(item);
		}
	}

	return compacted;
}
