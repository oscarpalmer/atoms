import {getLimiter} from '../internal/function/limiter';
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
	return getLimiter(callback, false, time);
}

// #endregion
