import {DEFAULT_HWB, MAX_PERCENT} from '../constants';
import {getFixedColorValue} from '../misc';
import {getAlphaValue} from '../misc/alpha';
import {getDegrees, getPercentage} from '../misc/get';
import {isHwbLike} from '../misc/is';
import type {HSLAColor, HSLColor, HWBAColor, HWBColor, RGBAColor, RGBColor} from '../models';
import {hslToRgb, hslToRgba} from './hsl';
import {rgbToHex} from './rgb';

// #region Functions

export function convertHwbToHsl(input: HWBAColor | HWBColor): HSLAColor {
	let {blackness, hue, whiteness} = isHwbLike(input) ? getHwbValue(input) : DEFAULT_HWB;

	blackness /= MAX_PERCENT;
	whiteness /= MAX_PERCENT;

	const value = 1 - blackness;

	let saturation = 0;

	if (1 - blackness === 0) {
		saturation = 0;
	} else {
		saturation = (1 - blackness - whiteness) / (1 - blackness);
	}

	const lightness = blackness * (1 - saturation / 2);

	if (lightness === 0 || lightness === 1) {
		saturation = 0;
	} else {
		saturation = (value - lightness) / Math.min(lightness, 1 - lightness);
	}

	return {
		hue,
		alpha: getAlphaValue((input as HWBAColor)?.alpha ?? MAX_PERCENT),
		lightness: getFixedColorValue(lightness * MAX_PERCENT),
		saturation: getFixedColorValue(saturation * MAX_PERCENT),
	};
}

export function getHwbValue(value: Record<keyof HWBColor, unknown>): HWBColor {
	return {
		blackness: getPercentage(value.blackness),
		hue: getDegrees(value.hue),
		whiteness: getPercentage(value.whiteness),
	};
}

/**
 * Convert an _HWB(A)_ color to a hex color _(with optional alpha channel, i.e., opacity)_
 *
 * _If the value is unable to be converted, a black hex color will be returned_
 *
 * @param hwb _HWB(A)_ color
 * @param alpha Include alpha channel _(opacity)_? _(defaults to `false`)_
 * @returns Hex color string
 */
export function hwbToHex(hwb: HWBAColor | HWBColor, alpha?: boolean): string {
	return rgbToHex(hwbToRgb(hwb), alpha);
}

/**
 * Convert an _HWB(A)_ color to an _RGB_ color
 *
 * _If the value is unable to be converted, a black _RGB_ color will be returned_
 *
 * @param hwb _HWB(A)_ color
 * @returns _RGB_ color
 */
export function hwbToHsl(hwb: HWBAColor | HWBColor): HSLColor {
	const {hue, lightness, saturation} = convertHwbToHsl(hwb);

	return {
		hue,
		lightness,
		saturation,
	};
}

/**
 * Convert an _HWB(A)_ color to an _HSLA_ color
 *
 * _If the value is unable to be converted, a black _HSLA_ color will be returned_
 *
 * @param hwb _HWB(A)_ color
 * @returns _HSLA_ color
 */
export function hwbToHsla(hwb: HWBAColor | HWBColor): HSLAColor {
	return convertHwbToHsl(hwb);
}

/**
 * Convert an _HWB(A)_ color to an _RGB_ color
 *
 * _If the value is unable to be converted, a black _RGB_ color will be returned_
 *
 * @param hwb _HWB(A)_ color
 * @returns _RGB_ color
 */
export function hwbToRgb(hwb: HWBAColor | HWBColor): RGBColor {
	return hslToRgb(hwbToHsl(hwb));
}

/**
 * Convert an _HWB(A)_ color to an _RGBA_ color
 *
 * _If the value is unable to be converted, a black _RGBA_ color will be returned_
 *
 * @param hwb _HWB(A)_ color
 * @returns _RGBA_ color
 */
export function hwbToRgba(hwb: HWBAColor | HWBColor): RGBAColor {
	return hslToRgba(hwbToHsla(hwb));
}

// #endregion
