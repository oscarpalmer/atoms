// #region Functions

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

// #endregion

// #region Variables

const TOTAL = 10;

const TRIM_PART = 2;

const TRIM_TOTAL = 4;

let FRAME_RATE_MS = 1000 / 60;

// #endregion

// #region Initialization

/**
 * A calculated average of the refresh rate of the display _(in milliseconds)_
 */
calculate().then(value => {
	FRAME_RATE_MS = value;
});

// #endregion

// #region Exports

export default FRAME_RATE_MS;

// #endregion
