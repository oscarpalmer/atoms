type NavigatorWithMsMaxTouchPoints = Navigator & {
	msMaxTouchPoints: number;
};

type Position = {
	x: number;
	y: number;
};

/**
 * Does the browser support touch events?
 */
export const supportsTouch = (() => {
	let value = false;

	try {
		if ('matchMedia' in window) {
			const media = matchMedia('(pointer: coarse)');

			if (typeof media?.matches === 'boolean') {
				value = media.matches;
			}
		}

		if (!value) {
			value =
				'ontouchstart' in window ||
				navigator.maxTouchPoints > 0 ||
				((navigator as NavigatorWithMsMaxTouchPoints).msMaxTouchPoints ?? 0) >
					0;
		}
	} catch {
		value = false;
	}

	return value;
})();

/**
 * Get the X- and Y-coordinates from a pointer event
 */
export function getPosition(
	event: MouseEvent | TouchEvent,
): Position | undefined {
	let x: number | undefined;
	let y: number | undefined;

	if (event instanceof MouseEvent) {
		x = event.clientX;
		y = event.clientY;
	} else if (event instanceof TouchEvent) {
		x = event.touches[0]?.clientX;
		y = event.touches[0]?.clientY;
	}

	return typeof x === 'number' && typeof y === 'number' ? {x, y} : undefined;
}
