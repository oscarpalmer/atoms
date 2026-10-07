import type {GenericAsyncCallback, GenericCallback} from '../index';

// #region Types

export type AsyncLimiterItem = {
	parameters: unknown[];
	promise: Promise<unknown>;
	reject(reason?: unknown): void;
	resolve(value?: unknown): void;
	running: boolean;
};

/**
 * An asynchronous function that can be cancelled
 */
export type AsyncLimiter<Callback extends GenericAsyncCallback> = {
	/**
	 * Cancel the function
	 */
	cancel(): void;
	/**
	 * Call the function
	 *
	 * @param parameters Function parameters
	 * @returns Function result
	 */
	run(...parameters: Parameters<Callback>): Promise<ReturnType<Callback>>;
};

export type AsyncLimiterState = {
	last?: AsyncLimiterItem;
} & LimiterState<GenericAsyncCallback>;

export type InternalAsyncLimiter = {
	[LIMITER_SYMBOL]: AsyncLimiterState;
} & AsyncLimiter<GenericAsyncCallback>;

export type InternalLimiter = {
	[LIMITER_SYMBOL]: LimiterState;
} & Limiter<GenericCallback>;

/**
 * A function that can be cancelled
 */
export type Limiter<Callback extends GenericCallback> = {
	/**
	 * Cancel the function
	 */
	cancel(): void;
	/**
	 * Call the function
	 *
	 * @param parameters Function parameters
	 * @returns Function result
	 */
	run(...parameters: Parameters<Callback>): ReturnType<Callback>;
};

export type LimiterState<Callback = GenericCallback> = {
	callback: Callback;
	interval: number;
	parameters: unknown[];
	start?: number;
	throttle: boolean;
	timer?: number;
	type: LimiterType;
};

export type LimiterType = 'debounce' | 'throttle' | 'wait';

// #endregion

// #region Variables

export const LIMITER_DEBOUNCE: LimiterType = 'debounce';

export const LIMITER_NAME_ASYNC = 'asyncLimiter';

export const LIMITER_NAME_SYNC = 'limiter';

export const LIMITER_PROPERTY = '$limiter';

export const LIMITER_OFFSET = 5;

export const LIMITER_SYMBOL: unique symbol = Symbol('limiter');

export const LIMITER_THROTTLE: LimiterType = 'throttle';

export const LIMITER_WAIT: LimiterType = 'wait';

// istanbul ignore next
export const clearTimer: (handle: number) => void =
	typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout;

// istanbul ignore next
export const startTimer: (callback: FrameRequestCallback) => number =
	typeof requestAnimationFrame === 'function' ? requestAnimationFrame : setTimeout;

// #endregion
