import {getTimer, TIMER_DEBOUNCE, TIMER_THROTTLE} from '../internal/function/timer';
import type {CancelableCallback, GenericCallback} from '../models';

// #region Functions

/**
 * Debounce a function, ensuring it is only called after `time` milliseconds have passed
 *
 * On subsequent calls, the timer is reset and will wait another `time` milliseconds _(and so on...)_
 * @param callback Callback to debounce
 * @param time Time in milliseconds to wait before calling the callback _(defaults to match frame rate)_
 * @returns Debounced callback with a `cancel` method
 */
export function debounce<Callback extends GenericCallback>(
	callback: Callback,
	time?: number,
): CancelableCallback<Callback> {
	return getTimer(TIMER_DEBOUNCE, callback, time);
}

/**
 * Throttle a function, ensuring it is only called once every `time` milliseconds
 * @param callback Callback to throttle
 * @param time Time in milliseconds to wait before calling the callback again _(defaults to match frame rate)_
 * @returns Throttled callback with a `cancel` method
 */
export function throttle<Callback extends GenericCallback>(
	callback: Callback,
	time?: number,
): CancelableCallback<Callback> {
	return getTimer(TIMER_THROTTLE, callback, time);
}

// #endregion

// #region Exports

export {noop} from '../internal/function/misc';
export {memoize, type Memoized, type MemoizedOptions} from './memoize';
export {once} from './once';

// #endregion
