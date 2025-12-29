function calculate(): Promise<number> {
	return new Promise(resolve => {
		const values: number[] = [];

		let last: DOMHighResTimeStamp;

		function step(now: DOMHighResTimeStamp): void {
			if (last != null) {
				values.push(now - last);
			}

			last = now;

			if (values.length >= TOTAL) {
				const median =
					values
						.sort()
						.slice(TRIM_PART, -TRIM_PART)
						.reduce((first, second) => first + second, 0) /
					(values.length - TRIM_TOTAL);

				resolve(median);
			} else {
				requestAnimationFrame(step);
			}
		}

		requestAnimationFrame(step);
	});
}

//

const TOTAL = 10;

const TRIM_PART = 2;

const TRIM_TOTAL = 4;

/**
 * A calculated average of the refresh rate of the display _(in milliseconds)_
 */
const FRAME_RATE_MS = await calculate();

/* calculate().then(value => {
	FRAME_RATE_MS = value;
}); */

export default FRAME_RATE_MS;
