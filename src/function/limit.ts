import {getAsyncLimiter, getLimiter} from '../internal/function/limit';
import {isAsyncFunction} from '../internal/is';
import {
	LIMITER_DEBOUNCE,
	LIMITER_MESSAGE_CALLBACK,
	LIMITER_THROTTLE,
	type AsyncLimiter,
	type Limiter,
} from '../models/function/limiter.model';
import type {GenericAsyncCallback, GenericCallback} from '../models/index';

// #region Functions

/**
 * Debounce a function, ensuring it is only called after `time` milliseconds have passed
 *
 * - When called, successful _(finished)_ results will resolve and errors will reject
 * - On subsequent calls, existing calls will be canceled _(rejected)_, the timer reset, and will wait another `time` milliseconds before the new call is made _(and so on...)_
 *
 * @param callback Callback to debounce
 * @param time Time in milliseconds to wait before calling the callback _(defaults to `0`; e.g., as soon as possible)_
 * @returns Debounced callback handler with a `cancel` method
 */
export function debounce<Callback extends GenericAsyncCallback>(
	callback: Callback,
	time?: number,
): AsyncLimiter<Callback>;

/**
 * Debounce a function, ensuring it is only called after `time` milliseconds have passed
 *
 * On subsequent calls, the timer is reset and will wait another `time` milliseconds _(and so on...)_
 *
 * @param callback Callback to debounce
 * @param time Time in milliseconds to wait before calling the callback _(defaults to `0`; e.g., as soon as possible)_
 * @returns Debounced callback handler with a `cancel` method
 */
export function debounce<Callback extends GenericCallback>(
	callback: Callback,
	time?: number,
): Limiter<Callback>;

export function debounce(callback: GenericCallback, time?: number) {
	if (typeof callback !== 'function') {
		throw new TypeError(LIMITER_MESSAGE_CALLBACK);
	}

	return isAsyncFunction(callback)
		? getAsyncLimiter(LIMITER_DEBOUNCE, callback, time)
		: getLimiter(LIMITER_DEBOUNCE, callback, time);
}

/**
 * Throttle a function, ensuring it is only called once every `time` milliseconds
 *
 * - When called, successful _(finished)_ results will resolve and errors will reject
 * - On subsequent calls, existing calls will be canceled _(rejected)_ and will wait until the next valid time to call the callback again _(and so on...)_
 *
 * @param callback Callback to throttle
 * @param time Time in milliseconds to wait before calling the callback again _(defaults to `0`; e.g., as soon as possible)_
 * @returns Throttled callback handler with a `cancel` method
 */
export function throttle<Callback extends GenericAsyncCallback>(
	callback: Callback,
	time?: number,
): AsyncLimiter<Callback>;

/**
 * Throttle a function, ensuring it is only called once every `time` milliseconds
 *
 * @param callback Callback to throttle
 * @param time Time in milliseconds to wait before calling the callback again _(defaults to `0`; e.g., as soon as possible)_
 * @returns Throttled callback handler with a `cancel` method
 */
export function throttle<Callback extends GenericCallback>(
	callback: Callback,
	time?: number,
): Limiter<Callback>;

export function throttle(callback: GenericCallback, time?: number) {
	if (typeof callback !== 'function') {
		throw new TypeError(LIMITER_MESSAGE_CALLBACK);
	}

	return isAsyncFunction(callback)
		? getAsyncLimiter(LIMITER_THROTTLE, callback, time)
		: getLimiter(LIMITER_THROTTLE, callback, time);
}

// #endregion

// #region Exports

export type {AsyncLimiter, Limiter};

// #endregion
