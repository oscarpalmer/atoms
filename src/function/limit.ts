import {getAsyncTimer, getTimer, TIMER_DEBOUNCE, TIMER_THROTTLE} from '../internal/function/timer';
import type {
	AsyncCancelableCallback,
	CancelableCallback,
	GenericAsyncCallback,
	GenericCallback,
} from '../models';

// #region Functions

/**
 * Debounce a function, ensuring it is only called after `time` milliseconds have passed
 *
 * When called, successful _(finished)_ results will resolve and errors will reject.
 *
 * On subsequent calls, existing calls will be canceled _(rejected)_, the timer reset, and will wait another `time` milliseconds before the new call is made _(and so on...)_
 *
 * Available as `asyncDebounce` and `debounce.async`
 * @param callback Callback to debounce
 * @param time Time in milliseconds to wait before calling the callback _(defaults to `0`; e.g., as soon as possible)_
 * @returns Debounced callback handler with a `cancel` method
 */
export function asyncDebounce<Callback extends GenericAsyncCallback | GenericCallback>(
	callback: Callback,
	time?: number,
): AsyncCancelableCallback<Callback> {
	return getAsyncTimer(TIMER_DEBOUNCE, callback, time);
}

/**
 * Throttle a function, ensuring it is only called once every `time` milliseconds
 *
 * When called, successful _(finished)_ results will resolve and errors will reject.
 *
 * On subsequent calls, existing calls will be canceled _(rejected)_ and will wait until the next valid time to call the callback again _(and so on...)_
 *
 * Available as `asyncThrottle` and `throttle.async`
 * @param callback Callback to throttle
 * @param time Time in milliseconds to wait before calling the callback again _(defaults to `0`; e.g., as soon as possible)_
 * @returns Throttled callback handler with a `cancel` method
 */
export function asyncThrottle<Callback extends GenericAsyncCallback | GenericCallback>(
	callback: Callback,
	time?: number,
): AsyncCancelableCallback<Callback> {
	return getAsyncTimer(TIMER_THROTTLE, callback, time);
}

/**
 * Debounce a function, ensuring it is only called after `time` milliseconds have passed
 *
 * On subsequent calls, the timer is reset and will wait another `time` milliseconds _(and so on...)_
 * @param callback Callback to debounce
 * @param time Time in milliseconds to wait before calling the callback _(defaults to `0`; e.g., as soon as possible)_
 * @returns Debounced callback handler with a `cancel` method
 */
export function debounce<Callback extends GenericCallback>(
	callback: Callback,
	time?: number,
): CancelableCallback<Callback> {
	return getTimer(TIMER_DEBOUNCE, callback, time);
}

debounce.async = asyncDebounce;

/**
 * Throttle a function, ensuring it is only called once every `time` milliseconds
 * @param callback Callback to throttle
 * @param time Time in milliseconds to wait before calling the callback again _(defaults to `0`; e.g., as soon as possible)_
 * @returns Throttled callback handler with a `cancel` method
 */
export function throttle<Callback extends GenericCallback>(
	callback: Callback,
	time?: number,
): CancelableCallback<Callback> {
	return getTimer(TIMER_THROTTLE, callback, time);
}

throttle.async = asyncThrottle;

// #endregion
