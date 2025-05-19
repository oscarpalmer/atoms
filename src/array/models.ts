export type CallbackSorter<Item> = {
	/**
	 * Comparator to use when comparing items and values
	 */
	compare?: (
		first: Item,
		firstValue: unknown,
		second: Item,
		secondValue: unknown,
	) => number;
	/**
	 * Direction to sort by
	 */
	direction?: 'ascending' | 'descending';
	/**
	 * Value to sort by
	 */
	value: (item: Item) => unknown;
};

export type KeySorter<Item> = {
	/**
	 * Comparator to use when comparing items and values
	 */
	compare?: (
		first: Item,
		firstValue: unknown,
		second: Item,
		secondValue: unknown,
	) => number;
	/**
	 * Direction to sort by
	 */
	direction?: 'ascending' | 'descending';
	/**
	 * Key to sort by
	 */
	key: keyof Item;
};
