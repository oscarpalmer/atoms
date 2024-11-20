import type {GenericCallback, Key} from '../models';

export type Callbacks = {
	bool?: GenericCallback;
	key?: GenericCallback;
	value?: GenericCallback;
};

export type FindType = 'index' | 'value';

export type InsertType = 'push' | 'splice';

export type SortKey<Item> = {
	direction: 'asc' | 'desc';
	value: Key | ((item: Item) => Key);
};

export type SortKeyWithCallback<Item> = {
	callback: (item: Item) => Key;
	direction: 'asc' | 'desc';
};
