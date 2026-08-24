import {
	DEFAULT_HSL,
	MAX_DEGREE,
	MAX_HEX,
	MAX_PERCENT,
	TYPE_HEX,
	TYPE_HWB,
	TYPE_RGB,
} from '../constants';
import {getAlphaValue} from '../misc/alpha';
import {getDegrees, getHexValue, getPercentage} from '../misc/get';
import {isHslLike} from '../misc/is';
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
import {convertRgbToHex} from './rgb';

// #region Functions

function convertHslToHwba(input: unknown): HWBAColor {
	const hsl = isHslLike(input) ? getHslValue(input) : {...DEFAULT_HSL};

	let {hue, lightness, saturation} = hsl;

	lightness /= MAX_PERCENT;
	saturation /= MAX_PERCENT;

	const value = lightness + saturation * Math.min(lightness, 1 - lightness);

	if (value === 0) {
		saturation = 0;
	} else {
		saturation = 2 * (1 - lightness / value);
	}

	const blackness = 1 - value;
	const whiteness = (1 - saturation) * value;

	return {
		hue,
		whiteness: whiteness * MAX_PERCENT,
		blackness: blackness * MAX_PERCENT,
		alpha: getAlphaValue((input as HSLAColor)?.alpha ?? MAX_PERCENT),
	};
}

function convertHslToRgba(input: unknown): RGBAColor {
	const hsl = isHslLike(input) ? getHslValue(input) : {...DEFAULT_HSL};

	const hue = hsl.hue % MAX_DEGREE;
	const saturation = hsl.saturation / MAX_PERCENT;
	const lightness = hsl.lightness / MAX_PERCENT;

	return {
		alpha: getAlphaValue((input as HSLAColor)?.alpha ?? MAX_PERCENT),
		blue: getHexValue(getHexyValue(hue, lightness, saturation, 4)),
		green: getHexValue(getHexyValue(hue, lightness, saturation, 8)),
		red: getHexValue(getHexyValue(hue, lightness, saturation, 0)),
	};
}

export function getColorFromHsl<Type extends ColorType>(
	state: ColorState,
	type: Type,
): NonNullable<ColorState[Type]> {
	switch (type) {
		case TYPE_HEX:
			state.hex = hslToHex(state.hsl!);
			break;

		case TYPE_HWB:
			state.hwb = hslToHwb(state.hsl!);
			break;

		case TYPE_RGB:
			state.rgb = hslToRgb(state.hsl!);
			break;
	}

	return state[type]!;
}

function getHexyValue(hue: number, lightness: number, saturation: number, value: number): number {
	const part = (value + hue / 30) % 12;
	const mod = saturation * Math.min(lightness, 1 - lightness);

	return (lightness - mod * Math.max(-1, Math.min(part - 3, 9 - part, 1))) * MAX_HEX;
}

export function getHslValue(value: Record<keyof HSLColor, unknown>): HSLColor {
	return {
		hue: getDegrees(value.hue),
		saturation: getPercentage(value.saturation),
		lightness: getPercentage(value.lightness),
	};
}

/**
 * Convert an _HSL(A)_ color to a hex color _(with optional alpha channel, i.e., opacity)_
 *
 * _If the value is unable to be converted, a black hex color will be returned_
 *
 * @param hsl _HSL(A)_ color
 * @param alpha Include alpha channel _(opacity)_? _(defaults to `false`)_
 * @returns Hex color string
 */
export function hslToHex(hsl: HSLAColor | HSLColor, alpha?: boolean): string {
	return convertRgbToHex(convertHslToRgba(hsl), alpha ?? false);
}

/**
 * Convert an _HSL(A)_ color to an _HWB_ color
 *
 * _If the value is unable to be converted, a black _HWB_ color will be returned_
 *
 * @param hsl HSL(A) color
 * @returns _HWB_ color
 */
export function hslToHwb(hsl: HSLAColor | HSLColor): HWBColor {
	const {blackness, hue, whiteness} = convertHslToHwba(hsl);

	return {
		hue,
		whiteness,
		blackness,
	};
}

/**
 * Convert an _HSL(A)_ color to an _HWBA_ color
 *
 * _If the value is unable to be converted, a black _HWBA_ color will be returned_
 *
 * @param hsl HSL(A) color
 * @returns _HWBA_ color
 */
export function hslToHwba(hsl: HSLAColor | HSLColor): HWBAColor {
	return convertHslToHwba(hsl);
}

/**
 * Convert an _HSL(A)_ color to an _RGB_ color
 *
 * _If the value is unable to be converted, a black _RGB_ color will be returned_
 *
 * _Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L61_
 *
 * @param hsl HSL(A) color
 * @returns _RGB_ color
 */
export function hslToRgb(hsl: HSLAColor | HSLColor): RGBColor {
	const {blue, green, red} = convertHslToRgba(hsl);

	return {
		blue,
		green,
		red,
	};
}

/**
 * Convert an _HSL(A)_ color to an _RGBA_ color
 *
 * _If the value is unable to be converted, a black _RGBA_ color will be returned_
 *
 * _Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L61_
 *
 * @param hsl HSL(A) color
 * @returns _RGBA_ color
 */
export function hslToRgba(hsl: HSLAColor | HSLColor): RGBAColor {
	return convertHslToRgba(hsl);
}

// #endregion
