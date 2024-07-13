import type {Key} from '../models';

export type BooleanCallback<Value> = GenericCallback<Value, boolean>;

export type Callbacks<Value> = {
	bool?: BooleanCallback<Value>;
	key?: KeyCallback<Value>;
};

export type FindType = 'index' | 'value';

export type GenericCallback<Value, Returned> = (
	value: Value,
	index: number,
	array: Value[],
) => Returned;

export type InsertType = 'push' | 'splice';

export type KeyCallback<Value> = GenericCallback<Value, Key>;

export type SortKey<Value> = {
	direction: 'asc' | 'desc';
	value: Key | SortKeyCallback<Value>;
};

export type SortKeyCallback<Value> = (value: Value) => Key;

export type SortKeyWithCallback<Value> = {
	callback: SortKeyCallback<Value>;
	direction: 'asc' | 'desc';
};
