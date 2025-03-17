type NavigatorWithMsMaxTouchPoints = Navigator & {
	msMaxTouchPoints: number;
};

/**
 * Does the browser/device support touch?
 */
const supportsTouch = (() => {
	if (typeof window === 'undefined' || typeof navigator === 'undefined') {
		return false;
	}

	try {
		if ('matchMedia' in window) {
			const media = matchMedia('(pointer: coarse)');

			if (typeof media?.matches === 'boolean' && media.matches) {
				return true;
			}
		}

		if ('ontouchstart' in window) {
			return true;
		}

		if (
			typeof navigator.maxTouchPoints === 'number' &&
			navigator.maxTouchPoints > 0
		) {
			return true;
		}

		if (
			typeof (navigator as NavigatorWithMsMaxTouchPoints).msMaxTouchPoints ===
				'number' &&
			(navigator as NavigatorWithMsMaxTouchPoints).msMaxTouchPoints > 0
		) {
			return true;
		}

		return false;
	} catch {
		return false;
	}
})();

export default supportsTouch;
