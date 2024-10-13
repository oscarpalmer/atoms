import type {GenericCallback, Key} from '~/models';

export type ArrayCallback<Item, Value> = (
	item: Item,
	index: number,
	array: Item[],
) => Value;

export type BooleanCallback<Item> = ArrayCallback<Item, boolean>;

export type Callbacks = {
	bool?: GenericCallback;
	key?: GenericCallback;
	value?: GenericCallback;
};

export type FindType = 'index' | 'value';

export type InsertType = 'push' | 'splice';

export type KeyCallback<Item> = ArrayCallback<Item, Key>;

export type SortKey<Item> = {
	direction: 'asc' | 'desc';
	value: Key | SortKeyCallback<Item>;
};

export type SortKeyCallback<Item> = (item: Item) => unknown;

export type SortKeyWithCallback<Item> = {
	callback: SortKeyCallback<Item>;
	direction: 'asc' | 'desc';
};

export type ValueCallback<Item> = ArrayCallback<Item, unknown>;
