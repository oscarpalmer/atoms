function calculate(): Promise<number> {
	return new Promise(resolve => {
		const values: number[] = [];

		let last: DOMHighResTimeStamp | undefined;

		function step(now: DOMHighResTimeStamp): void {
			if (last != null) {
				values.push(now - last);
			}

			last = now;

			if (values.length >= 10) {
				const median =
					values
						.sort()
						.slice(2, -2)
						.reduce((first, second) => first + second, 0) /
					(values.length - 4);

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

/**
 * A calculated average of the refresh rate of the display _(in milliseconds)_
 */
export let milliseconds: number = 1000 / 60;

calculate().then(value => {
	milliseconds = value;
});
