import {getLimiter} from '../internal/function/limiter';
import type {CancelableCallback, GenericCallback} from '../models';

// #region Functions

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
	return getLimiter(callback, true, time);
}

// #endregion
