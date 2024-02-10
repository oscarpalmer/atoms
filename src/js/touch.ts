type NavigatorWithMsMaxTouchPoints = Navigator & {
	msMaxTouchPoints: number;
};

/**
 * Does the browser/device support touch?
 */
const supportsTouch = (() => {
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

export default supportsTouch;
