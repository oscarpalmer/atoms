/**
 * Sorting information for arrays _(using a callback)_
 */
export type CallbackSorter<Item> = {
	/**
	 * Comparator to use when comparing items and values
	 */
	compare?: (first: Item, firstValue: unknown, second: Item, secondValue: unknown) => number;
	/**
	 * Direction to sort by
	 */
	direction?: 'ascending' | 'descending';
	/**
	 * Value to sort by
	 */
	value: (item: Item) => unknown;
};

/**
 * Sorting information for arrays _(using a key)_
 */
export type KeySorter<Item> = {
	/**
	 * Comparator to use when comparing items and values
	 */
	compare?: (first: Item, firstValue: unknown, second: Item, secondValue: unknown) => number;
	/**
	 * Direction to sort by
	 */
	direction?: 'ascending' | 'descending';
	/**
	 * Key to sort by
	 */
	key: keyof Item;
};

/**
 * The numerical keys of an object
 */
export type NumericalKeys<Value> = {
	[Key in keyof Value]: Key extends number ? Key : Key extends `${number}` ? Key : never;
}[keyof Value];

export type {Key, KeyedValue, NestedArray, PlainObject} from '../models';
