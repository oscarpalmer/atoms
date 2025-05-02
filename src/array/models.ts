import type {Key} from '../models';

/**
 * A key for sorting an array
 */
export type Sorter<Item> = {
	/**
	 * Direction to sort by
	 */
	direction: 'asc' | 'desc';
	/**
	 * - Key to sort by
	 * - Callback for retrieving a key value
	 */
	value: Key | ((item: Item) => unknown);
};
