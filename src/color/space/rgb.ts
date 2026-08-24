import {join} from '../../internal/string';
import {COLOR_DEFAULTS, COLOR_MAX, COLOR_TYPE} from '../constants';
import {getAlpha, getAlphaValue} from '../misc/alpha';
import {getHexValue} from '../misc/get';
import {isRgbLike} from '../misc/is';
import type {
	ColorState,
	ColorType,
	HSLAColor,
	HSLColor,
	HWBAColor,
	HWBColor,
	RGBAColor,
	RGBColor,
} from '../models';

// #region Types

type RgbValues = {
	blue: number;
	delta: number;
	green: number;
	max: number;
	min: number;
	red: number;
};

// #endregion

// #region Functions

export function convertRgbToHex(rgb: RGBAColor | RGBColor, alpha: boolean): string {
	const hex = `${join(
		[rgb.red, rgb.green, rgb.blue].map(color => {
			const hexString = color.toString(16);

			return hexString.length === 1 ? `0${hexString}` : hexString;
		}),
	)}`;

	let a = '';

	if (typeof alpha === 'boolean' && alpha) {
		a = getAlpha((rgb as RGBAColor).alpha, false).hex;
	}

	return `${hex}${a}`;
}

export function convertRgbToHsla(value: unknown): HSLAColor {
	const rgb = isRgbLike(value) ? getRgbValue(value) : {...COLOR_DEFAULTS.rgb};
	const values = getRgbValues(rgb);

	const {delta, max, min} = values;

	const lightness = (min + max) / 2;

	let hue = 0;
	let saturation = 0;

	if (delta !== 0) {
		saturation = (max - lightness) / Math.min(lightness, 1 - lightness);

		hue = getRgbHue(values);

		hue *= 60;
	}

	return {
		hue,
		saturation: saturation * COLOR_MAX.percent,
		lightness: lightness * COLOR_MAX.percent,
		alpha: getAlphaValue((value as RGBAColor)?.alpha ?? COLOR_MAX.percent),
	};
}

export function convertRgbToHwba(value: unknown): HWBAColor {
	const rgb = isRgbLike(value) ? getRgbValue(value) : {...COLOR_DEFAULTS.rgb};
	const values = getRgbValues(rgb);

	const {delta, max, min} = values;

	let hue = 0;

	if (delta !== 0) {
		hue = getRgbHue(values);

		hue *= 60;
	}

	return {
		hue,
		whiteness: min * COLOR_MAX.percent,
		blackness: (1 - max) * COLOR_MAX.percent,
		alpha: getAlphaValue((value as RGBAColor)?.alpha ?? COLOR_MAX.percent),
	};
}

export function getColorFromRgb<Type extends ColorType>(
	state: ColorState,
	type: Type,
): NonNullable<ColorState[Type]> {
	switch (type) {
		case COLOR_TYPE.hex:
			state.hex = rgbToHex(state.rgb!);
			break;

		case COLOR_TYPE.hsl:
			state.hsl = rgbToHsl(state.rgb!);
			break;

		case COLOR_TYPE.hwb:
			state.hwb = rgbToHwb(state.rgb!);
			break;
	}

	return state[type]!;
}

function getRgbHue(values: RgbValues): number {
	const {blue, delta, green, max, red} = values;

	switch (max) {
		case blue:
			return (red - green) / delta + 4;

		case green:
			return (blue - red) / delta + 2;

		default:
			return (green - blue) / delta + (green < blue ? 6 : 0);
	}
}

export function getRgbValue(value: Record<keyof RGBColor, unknown>): RGBColor {
	return {
		blue: getHexValue((value as RGBColor).blue),
		green: getHexValue((value as RGBColor).green),
		red: getHexValue((value as RGBColor).red),
	};
}

function getRgbValues(rgb: RGBColor): RgbValues {
	const blue = rgb.blue / COLOR_MAX.hex;
	const green = rgb.green / COLOR_MAX.hex;
	const red = rgb.red / COLOR_MAX.hex;

	const max = Math.max(blue, green, red);
	const min = Math.min(blue, green, red);

	const delta = max - min;

	return {blue, delta, green, max, min, red};
}

/**
 * Convert an _RGB(A)_ color to a hex color _(with optional alpha channel, i.e., opacity)_
 *
 * _If the value is unable to be converted, a black hex color will be returned_
 *
 * @param rgb _RGB(A)_ color
 * @param alpha Include alpha channel _(opacity)_? _(defaults to `false`)_
 * @returns Hex color string
 */
export function rgbToHex(rgb: RGBAColor | RGBColor, alpha?: boolean): string {
	return convertRgbToHex(
		isRgbLike(rgb) ? getRgbValue(rgb) : {...COLOR_DEFAULTS.rgb},
		alpha ?? false,
	);
}

/**
 * Convert an _RGB(A)_ color to an _HSL_ color
 *
 * _If the value is unable to be converted, a black _HSL_ color will be returned_
 *
 * _Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L26_
 *
 * @param rgb _RGB(A)_ color
 * @returns _HSL_ color
 */
export function rgbToHsl(rgb: RGBAColor | RGBColor): HSLColor {
	const {hue, lightness, saturation} = convertRgbToHsla(rgb);

	return {
		hue,
		lightness,
		saturation,
	};
}

/**
 * Convert an _RGB(A)_ color to an _HSLA_ color
 *
 * _If the value is unable to be converted, a black _HSLA_ color will be returned_
 *
 * _Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L26_
 *
 * @param rgb _RGB(A)_ color
 * @returns _HSLA_ color
 */
export function rgbToHsla(rgb: RGBAColor | RGBColor): HSLAColor {
	return convertRgbToHsla(rgb);
}

/**
 * Convert an _RGB(A)_ color to an _HWB_ color
 *
 * _If the value is unable to be converted, a black _HWB_ color will be returned_
 *
 * _Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L26_
 *
 * @param rgb _RGB(A)_ color
 * @returns _HWB_ color
 */
export function rgbToHwb(rgb: RGBAColor | RGBColor): HWBColor {
	const {blackness, hue, whiteness} = convertRgbToHwba(rgb);

	return {
		hue,
		whiteness,
		blackness,
	};
}

/**
 * Convert an _RGB(A)_ color to an _HWBA_ color

 * _If the value is unable to be converted, a black _HWBA_ color will be returned_
 *
 * _Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L26_
 *
 * @param rgb _RGB(A)_ color
 * @returns _HWBA_ color
 */
export function rgbToHwba(rgb: RGBAColor | RGBColor): HWBAColor {
	return convertRgbToHwba(rgb);
}

// #endregion
