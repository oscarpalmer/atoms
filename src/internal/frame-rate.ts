function calculate(): Promise<number> {
	return new Promise(resolve => {
		const values: number[] = [];

		let last: DOMHighResTimeStamp;

		function step(now: DOMHighResTimeStamp): void {
			if (last != null) {
				values.push(now - last);
			}

			last = now;

			if (values.length >= CALCULATION_TOTAL) {
				const median =
					values
						.sort()
						.slice(CALCULATION_TRIM_PART, -CALCULATION_TRIM_PART)
						.reduce((first, second) => first + second, 0) /
					(values.length - CALCULATION_TRIM_TOTAL);

				resolve(median);
			} else {
				requestAnimationFrame(step);
			}
		}

		requestAnimationFrame(step);
	});
}

//

const CALCULATION_TOTAL = 10;

const CALCULATION_TRIM_PART = 2;

const CALCULATION_TRIM_TOTAL = 4;

const DEFAULT_FPS = 60;

const MILLISECONDS_IN_SECOND = 1000;

/**
 * A calculated average of the refresh rate of the display _(in milliseconds)_
 */
let FRAME_RATE_MS = MILLISECONDS_IN_SECOND / DEFAULT_FPS;

calculate().then(value => {
	FRAME_RATE_MS = value;
});

export default FRAME_RATE_MS;
