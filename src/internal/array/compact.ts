// #region Functions

/**
 * Compact an array _(removing all false-y values)_
 * @param array Array to compact
 * @param strict True to remove all false-y values
 * @returns Compacted array
 */
export function compact<Item>(
	array: Item[],
	strict: true,
): Exclude<Item, 0 | '' | false | null | undefined>[];

/**
 * Compact an array _(removing all `null` and `undefined` values)_
 * @param array Array to compact
 * @returns Compacted array
 */
export function compact<Item>(array: Item[]): Exclude<Item, null | undefined>[];

export function compact<Item>(array: Item[], strict?: unknown): Item[] {
	if (!Array.isArray(array)) {
		return [];
	}

	if (strict === true) {
		return array.filter(Boolean);
	}

	const {length} = array;
	const compacted: Item[] = [];

	for (let index = 0; index < length; index += 1) {
		const item = array[index];

		if (item != null) {
			compacted.push(item);
		}
	}

	return compacted;
}

// #endregion
