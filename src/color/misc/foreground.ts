import {
	HEX_BLACK,
	HEX_WHITE,
	MAX_HEX,
	SRGB_LUMINANCE_BLUE,
	SRGB_LUMINANCE_EXPONENT,
	SRGB_LUMINANCE_GREEN,
	SRGB_LUMINANCE_MINIMUM,
	SRGB_LUMINANCE_MODIFIER,
	SRGB_LUMINANCE_MULTIPLIER,
	SRGB_LUMINANCE_OFFSET,
	SRGB_LUMINANCE_RED,
	SRGB_LUMINANCE_THRESHOLD,
} from '../constants';
import {Color} from '../instance';
import {getState} from './state';

/**
 * Get a foreground color _(usually text)_ based on a background color's luminance
 * @param value Original value
 * @returns Foreground color
 */
export function getForegroundColor(value: unknown): Color {
	const state = getState(value);
	const {blue, green, red} = state.rgb;

	const values = [blue / MAX_HEX, green / MAX_HEX, red / MAX_HEX];

	for (let color of values) {
		if (color <= SRGB_LUMINANCE_MINIMUM) {
			color /= SRGB_LUMINANCE_MULTIPLIER;
		} else {
			color =
				((color + SRGB_LUMINANCE_OFFSET) / SRGB_LUMINANCE_MODIFIER) **
				SRGB_LUMINANCE_EXPONENT;
		}
	}

	const luminance =
		SRGB_LUMINANCE_RED * values[2] +
		SRGB_LUMINANCE_GREEN * values[1] +
		SRGB_LUMINANCE_BLUE * values[0];

	// Rudimentary and ureliable?; implement APCA for more reliable results?
	return new Color(
		luminance > SRGB_LUMINANCE_THRESHOLD ? HEX_BLACK : HEX_WHITE,
	);
}
