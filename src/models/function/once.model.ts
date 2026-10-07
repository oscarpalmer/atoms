import type {GenericAsyncCallback, GenericCallback} from '../index';

// #region Types

/**
 * An asynchronous function that can only be called once, returning the same value on subsequent calls
 */
export type AsyncOnce<Callback extends GenericAsyncCallback> = {
	/**
	 * Did the callback's promise reject?
	 */
	readonly error: boolean;
	/**
	 * Has the callback finished?
	 */
	readonly finished: boolean;
	/**
	 * Run the callback
	 *
	 * @param parameters Callback parameters
	 * @returns Call result
	 */
	run(...parameters: Parameters<Callback>): ReturnType<Callback>;
} & OnceProperties;

export type AsyncOnceItem<Value> = {
	reject(reason?: unknown): void;
	resolve(value: Value): void;
};

export type AsyncOnceState<Value> = {
	error: boolean;
	finished: boolean;
	items: Array<AsyncOnceItem<Value>>;
} & OnceState<Value, GenericAsyncCallback>;

export type InternalAsyncOnce = {
	[ONCE_SYMBOL]: AsyncOnceState<unknown>;
} & AsyncOnce<GenericAsyncCallback>;

export type InternalOnce = {
	[ONCE_SYMBOL]: OnceState<unknown>;
} & Once<GenericCallback>;

/**
 * A callback function that can only be called once, returning the same value on subsequent calls
 */
export type Once<Callback extends GenericCallback> = {
	/**
	 * Run the callback
	 *
	 * @param parameters Callback parameters
	 * @returns Call result
	 */
	run(...parameters: Parameters<Callback>): ReturnType<Callback>;
} & OnceProperties;

type OnceProperties = {
	/**
	 * Has the callback been called?
	 */
	readonly called: boolean;
	/**
	 * Has the callback's value been cleared?
	 */
	readonly cleared: boolean;
	/**
	 * Clear the callback's cached value
	 */
	clear(): void;
};

export type OnceState<Value, Callback = GenericCallback> = {
	callback: Callback;
	called: boolean;
	cleared: boolean;
	value: Value;
};

// #endregion

// #region Variables

export const ONCE_NAME_ASYNC = 'asyncOnce';

export const ONCE_NAME_SYNC = 'once';

export const ONCE_PROPERTY = '$once';

export const ONCE_MESSAGE_CLEARED = 'Once has been cleared';

export const ONCE_MESSAGE_EXPECTATION = 'Once expected a function';

export const ONCE_SYMBOL: unique symbol = Symbol(ONCE_PROPERTY);

// #endregion
