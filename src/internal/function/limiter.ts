import type {CancelableCallback} from '../../models';
import type {GenericCallback} from '../../models';

// #region Functions

export function getLimiter<Callback extends GenericCallback>(
	callback: Callback,
	throttler: boolean,
	time?: number,
): CancelableCallback<Callback> {
	const interval = typeof time === 'number' && time > 0 ? time : 0;;

	function step(now: DOMHighResTimeStamp, parameters: Parameters<Callback>): void {
		if (interval === 0 || now - timestamp >= interval) {
			if (throttler) {
				timestamp = now;
			}

			callback(...parameters);
		} else {
			frame = requestAnimationFrame(next => {
				step(next, parameters);
			});
		}
	}

	let frame: DOMHighResTimeStamp | undefined;
	let timestamp: DOMHighResTimeStamp;

	const limiter = (...parameters: Parameters<Callback>): void => {
		limiter.cancel();

		frame = requestAnimationFrame(now => {
			timestamp ??= now;

			step(now, parameters);
		});
	};

	limiter.cancel = (): void => {
		if (frame != null) {
			cancelAnimationFrame(frame);

			frame = undefined;
		}
	};

	return limiter as CancelableCallback<Callback>;
}

// #endregion
