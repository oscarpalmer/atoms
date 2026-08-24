import {round} from '../../internal/math/misc';
import {clamp} from '../../internal/number';
import {COLOR_DEFAULTS, COLOR_MAX, COLOR_SRGB, COLOR_TYPE} from '../constants';
import {color} from '../instance';
import type {Color, HSLAColor, HSLColor, HWBAColor, HWBColor, RGBAColor, RGBColor} from '../models';
import {getColorFromState, getColorState} from './state';

// #region Functions

function getClampedValue(
	value: unknown,
	minimum: number,
	maximum: number,
	rounding?: boolean,
): number {
	return typeof value === 'number' && !Number.isNaN(value)
		? clamp((rounding ?? false) ? round(value) : value, minimum, maximum)
		: minimum;
}

/**
 * Get a foreground color _(usually text)_ based on a background color's luminance as an unprefixed hex color string
 *
 * - Values that can be parsed are: hex(a) color strings, as well as _HSL(A)_, _HWB(A)_, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a white foreground color will be returned
 *
 * @param value Original value
 * @returns Foreground color
 */
export function getForegroundColor(value: unknown, hex: true): string;

/**
 * Get a foreground color _(usually text)_ based on a background color's luminance
 *
 * - Values that can be parsed are: hex(a) color strings, as well as _HSL(A)_, _HWB(A)_, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a white foreground color will be returned
 *
 * @param value Original value
 * @returns Foreground color
 */
export function getForegroundColor(value: unknown): Color;

export function getForegroundColor(value: unknown, hex?: unknown): string | Color {
	const rgb = getColorFromState(getColorState(value), COLOR_TYPE.rgb);
	const {blue, green, red} = rgb;

	const values = [blue / COLOR_MAX.hex, green / COLOR_MAX.hex, red / COLOR_MAX.hex];
	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const color = values[index];

		if (color <= COLOR_SRGB.luminanceMinimum) {
			values[index] /= COLOR_SRGB.luminanceMultiplier;
		} else {
			values[index] =
				((color + COLOR_SRGB.luminanceOffset) / COLOR_SRGB.luminanceModifier) **
				COLOR_SRGB.luminanceExponent;
		}
	}

	const luminance =
		COLOR_SRGB.luminanceRed * values[2] +
		COLOR_SRGB.luminanceGreen * values[1] +
		COLOR_SRGB.luminanceBlue * values[0];

	// Rudimentary and ureliable?; implement APCA for more reliable results?
	const foreground =
		luminance > COLOR_SRGB.luminanceThreshold ? COLOR_DEFAULTS.hexBlack : COLOR_DEFAULTS.hexWhite;

	return hex === true ? foreground : color(foreground);
}

/**
 * Get the hex color _(with alpha channel, i.e., opacity)_ from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, as well as _HSL(A)_, _HWB(A)_, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a black hex color will be returned
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
 * - Values that can be parsed are: hex(a) color strings, as well as _HSL(A)_, _HWB(A)_, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a black hex color will be returned
 *
 * @param value Original value
 * @returns Hex color string
 */
export function getHexColor(value: unknown): string {
	return getColorFromState(getColorState(value), COLOR_TYPE.hex);
}

export function getHexValue(value: unknown): number {
	return getClampedValue(value, 0, COLOR_MAX.hex, true);
}

export function getDegrees(value: unknown): number {
	return getClampedValue(value, 0, COLOR_MAX.degree);
}

/**
 * Get the _HSLA_ color from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, as well as _HSL(A)_, _HWB(A)_, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a black _HSLA_ color will be returned
 *
 * @param value Original value
 * @returns _HSLA_ color
 */
export function getHslaColor(value: unknown): HSLAColor {
	const state = getColorState(value);
	const hsl = getColorFromState(state, COLOR_TYPE.hsl);

	return {
		...hsl,
		alpha: state.alpha.value,
	};
}

/**
 * Get the _HWB_ color from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, as well as _HSL(A)_, _HWB(A)_, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a black _HWB_ color will be returned
 *
 * @param value Original value
 * @returns _HWB_ color
 */
export function getHwbColor(value: unknown): HWBColor {
	return getColorFromState(getColorState(value), COLOR_TYPE.hwb);
}

/**
 * Get the _HWBA_ color from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, as well as _HSL(A)_, _HWB(A)_, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a black _HWBA_ color will be returned
 *
 * @param value Original value
 * @returns _HWBA_ color
 */
export function getHwbaColor(value: unknown): HWBAColor {
	const state = getColorState(value);
	const hwb = getColorFromState(state, COLOR_TYPE.hwb);

	return {
		...hwb,
		alpha: state.alpha.value,
	};
}

/**
 * Get the _HSL_ color from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, as well as _HSL(A)_, _HWB(A)_, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a black _HSL_ color will be returned
 *
 * @param value Original value
 * @returns _HSL_ color
 */
export function getHslColor(value: unknown): HSLColor {
	return getColorFromState(getColorState(value), COLOR_TYPE.hsl);
}

export function getPercentage(value: unknown): number {
	return getClampedValue(value, 0, COLOR_MAX.percent);
}

/**
 * Get the _RGBA_ color from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, as well as _HSL(A)_, _HWB(A)_, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a black _RGBA_ color will be returned
 *
 * @param value Original value
 * @returns _RGBA_ color
 */
export function getRgbaColor(value: unknown): RGBAColor {
	const state = getColorState(value);
	const rgb = getColorFromState(state, COLOR_TYPE.rgb);

	return {
		...rgb,
		alpha: state.alpha.value,
	};
}

/**
 * Get the _RGB_ color from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, as well as _HSL(A)_, _HWB(A)_, and _RGB(A)_ color objects
 * - If the value cannot be parsed, a black _RGB_ color will be returned
 *
 * @param value Original value
 * @returns _RGB_ color
 */
export function getRgbColor(value: unknown): RGBColor {
	return getColorFromState(getColorState(value), COLOR_TYPE.rgb);
}

// #endregion
