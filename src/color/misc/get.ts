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
import type {HSLAColor, HSLColor, RGBAColor, RGBColor} from '../models';
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

/**
 * Get the hex color _(with alpha channel)_ from any kind of value
 * @param value Original value
 * @returns Hex color
 */
export function getHexaColor(value: unknown): string {
	const {alpha, hex} = getState(value);

	return `${hex}${alpha.hex}`;
}

/**
 * Get the hex color from any kind of value
 * @param value Original value
 * @returns Hex color
 */
export function getHexColor(value: unknown): string {
	return getState(value).hex;
}

/**
 * Get the HSLA color from any kind of value
 * @param value Original value
 * @returns HSLA color
 */
export function getHslaColor(value: unknown): HSLAColor {
	const {alpha, hsl} = getState(value);

	return {
		...hsl,
		alpha: alpha.value,
	};
}

/**
 * Get the HSL color from any kind of value
 * @param value Original value
 * @returns HSL color
 */
export function getHslColor(value: unknown): HSLColor {
	return getState(value).hsl;
}

/**
 * Get the RGBA color from any kind of value
 * @param value Original value
 * @returns RGBA color
 */
export function getRgbaColor(value: unknown): RGBAColor {
	const {alpha, rgb} = getState(value);

	return {
		...rgb,
		alpha: alpha.value,
	};
}

/**
 * Get the RGB color from any kind of value
 * @param value Original value
 * @returns RGB color
 */
export function getRgbColor(value: unknown): RGBColor {
	return getState(value).rgb;
}
