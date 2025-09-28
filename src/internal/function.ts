function calculate(): Promise<number> {
	return new Promise(resolve => {
		const values: number[] = [];

		let last: DOMHighResTimeStamp | undefined;

		function step(now: DOMHighResTimeStamp): void {
			if (last != null) {
				values.push(now - last);
			}

			last = now;

			if (values.length >= CALCULATION_TOTAL) {
				const median =
					values
						.sort()
						.slice(2, -2)
						.reduce((first, second) => first + second, 0) /
					(values.length - CALCULATION_TRIM);

				resolve(median);
			} else {
				requestAnimationFrame(step);
			}
		}

		requestAnimationFrame(step);
	});
}

/**
 * A function that does nothing, which can be useful, I guess…
 */
export function noop(): void {}

//

const CALCULATION_TOTAL = 10;

const CALCULATION_TRIM = 4;

const DEFAULT_FPS = 60;

const MILLISECONDS_IN_SECOND = 1000;

/**
 * A calculated average of the refresh rate of the display _(in milliseconds)_
 */
export let milliseconds: number = MILLISECONDS_IN_SECOND / DEFAULT_FPS;

calculate().then(value => {
	milliseconds = value;
});
