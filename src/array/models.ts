import type {GenericCallback, Key} from '../models';

export type Callbacks = {
		bool?: GenericCallback;
		keyed?: GenericCallback;
		value?: GenericCallback;
	};

export type FindValueType = 'index' | 'value';

export type FindValuesType = 'all' | 'unique';

export type InsertType = 'insert' | 'push' | 'splice';

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

export type SortKeyWithCallback<Item> = {
		callback: (item: Item) => unknown;
		direction: 'asc' | 'desc';
	};
