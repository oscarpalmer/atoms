/**
 * A function that does nothing, which can be useful, I guess…
 */
export function noop(): void {}

function step(now: DOMHighResTimeStamp): void {
	if (values.length === 7) {
		milliseconds =
			Math.floor(
				(values.slice(2).reduce((first, second) => first + second) / 5) * 2,
			) / 2;

		last = undefined;
		values.length = 0;
	} else {
		last ??= now;

		const difference = now - last;

		if (difference > 0) {
			values.push(difference);
		}

		last = now;

		requestAnimationFrame(step);
	}
}

//

const values: number[] = [];
let last: DOMHighResTimeStamp | undefined;

/**
 * A calculated average of the refresh rate of the display _(in milliseconds)_
 */
export let milliseconds = Math.floor((1000 / 60) * 2) / 2;

requestAnimationFrame(step);
