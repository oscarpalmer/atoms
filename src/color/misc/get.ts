import {clamp} from '../../number';
import {
	HEX_BLACK,
	HEX_WHITE,
	MAX_DEGREE,
	MAX_HEX,
	MAX_PERCENT,
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
import {getColorState} from './state';

// #region Functions

function getClampedValue(value: unknown, minimum: number, maximum: number): number {
	return typeof value === 'number' ? clamp(value, minimum, maximum) : minimum;
}

/**
 * Get a foreground color _(usually text)_ based on a background color's luminance
 *
 * - Values that can be parsed are: hex(a) color strings, _HSL(A)_ color objects, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a white foreground color will be returned
 *
 * @param value Original value
 * @returns Foreground color
 */
export function getForegroundColor(value: unknown): Color {
	const state = getColorState(value);
	const {blue, green, red} = state.rgb;

	const values = [blue / MAX_HEX, green / MAX_HEX, red / MAX_HEX];
	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const color = values[index];

		if (color <= SRGB_LUMINANCE_MINIMUM) {
			values[index] /= SRGB_LUMINANCE_MULTIPLIER;
		} else {
			values[index] =
				((color + SRGB_LUMINANCE_OFFSET) / SRGB_LUMINANCE_MODIFIER) ** SRGB_LUMINANCE_EXPONENT;
		}
	}

	const luminance =
		SRGB_LUMINANCE_RED * values[2] +
		SRGB_LUMINANCE_GREEN * values[1] +
		SRGB_LUMINANCE_BLUE * values[0];

	// Rudimentary and ureliable?; implement APCA for more reliable results?
	return new Color(luminance > SRGB_LUMINANCE_THRESHOLD ? HEX_BLACK : HEX_WHITE);
}

/**
 * Get the hex color _(with alpha channel, i.e., opacity)_ from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, _HSL(A)_ color objects, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a black hex color with an alpha channel of `0` will be returned
 *
 * @param value Original value
 * @returns Hex color string
 */
export function getHexaColor(value: unknown): string {
	const {alpha, hex} = getColorState(value);

	return `${hex}${alpha.hex}`;
}

/**
 * Get the hex color from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, _HSL(A)_ color objects, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a black hex color will be returned
 *
 * @param value Original value
 * @returns Hex color string
 */
export function getHexColor(value: unknown): string {
	return getColorState(value).hex;
}

export function getHexValue(value: unknown): number {
	return getClampedValue(value, 0, MAX_HEX);
}

export function getDegrees(value: unknown): number {
	return getClampedValue(value, 0, MAX_DEGREE);
}

/**
 * Get the _HSLA_ color from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, _HSL(A)_ color objects, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a black _HSLA_ color with an alpha channel _(opacity)_ of `0` will be returned
 *
 * @param value Original value
 * @returns _HSLA_ color
 */
export function getHslaColor(value: unknown): HSLAColor {
	const {alpha, hsl} = getColorState(value);

	return {
		...hsl,
		alpha: alpha.value,
	};
}

/**
 * Get the _HSL_ color from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, _HSL(A)_ color objects, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a black _HSL_ color will be returned
 *
 * @param value Original value
 * @returns _HSL_ color
 */
export function getHslColor(value: unknown): HSLColor {
	return getColorState(value).hsl;
}

export function getPercentage(value: unknown): number {
	return getClampedValue(value, 0, MAX_PERCENT);
}

/**
 * Get the _RGBA_ color from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, _HSL(A)_ color objects, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a black _RGBA_ color with an alpha channel _(opacity)_ of `0` will be returned
 *
 * @param value Original value
 * @returns _RGBA_ color
 */
export function getRgbaColor(value: unknown): RGBAColor {
	const {alpha, rgb} = getColorState(value);

	return {
		...rgb,
		alpha: alpha.value,
	};
}

/**
 * Get the _RGB_ color from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, _HSL(A)_ color objects, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a black _RGB_ color will be returned
 *
 * @param value Original value
 * @returns _RGB_ color
 */
export function getRgbColor(value: unknown): RGBColor {
	return getColorState(value).rgb;
}

// #endregion
