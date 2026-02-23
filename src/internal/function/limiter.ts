import type {CancellableCallback} from '../../models';
import type {GenericCallback} from '../../models';
import FRAME_RATE_MS from '../frame-rate';

// #region Functions

export function getLimiter<Callback extends GenericCallback>(
	callback: Callback,
	throttler: boolean,
	time?: number,
): CancellableCallback<Callback> {
	const interval = typeof time === 'number' && time >= FRAME_RATE_MS ? time : FRAME_RATE_MS;

	function step(now: DOMHighResTimeStamp, parameters: Parameters<Callback>): void {
		if (interval === FRAME_RATE_MS || now - timestamp >= interval) {
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
			timestamp ??= now - FRAME_RATE_MS;

			step(now, parameters);
		});
	};

	limiter.cancel = (): void => {
		if (frame != null) {
			cancelAnimationFrame(frame);

			frame = undefined;
		}
	};

	return limiter as CancellableCallback<Callback>;
}

// #endregion
