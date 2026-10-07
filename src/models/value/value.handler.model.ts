import type {Constructor, GenericCallback} from '../index';

// #region Types

export type BaseHandler = {
	handlers: WeakMap<WeakKey, string | GenericCallback>;
	options: BaseHandlerOptions;
	owner: GenericCallback;
	deregister(constructor: Constructor): void;
	get(first: unknown, second: unknown): string | GenericCallback | undefined;
	register(constructor: Constructor, handler?: string | GenericCallback): void;
};

export type BaseHandlerOptions = {
	callback: GenericCallback;
	method?: string;
};

export type CompareHandler<Value> = {
	base: BaseHandler;
	handle(first: unknown, second: unknown, ...parameters: unknown[]): Value;
};

export type Constructable = {
	constructor: Constructor;
};

export type Handleable = Record<string, GenericCallback>;

export type ValueHandler = {
	base: BaseHandler;
	handle(value: unknown, ...parameters: unknown[]): unknown;
};

// #endregion
