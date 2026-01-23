import {ALPHA_FULL_VALUE, DEFAULT_HSL, MAX_DEGREE, MAX_HEX, MAX_PERCENT} from '../constants';
import {getAlphaValue} from '../misc/alpha';
import {getHexValue, getDegrees, getPercentage} from '../misc/get';
import {isHslLike} from '../misc/is';
import type {HSLAColor, HSLColor, RGBAColor, RGBColor} from '../models';
import {convertRgbToHex} from './rgb';

// #region Functions

function convertHslToRgba(value: unknown): RGBAColor {
	const hsl = isHslLike(value) ? getHslValue(value) : {...DEFAULT_HSL};

	const hue = hsl.hue % MAX_DEGREE;
	const saturation = hsl.saturation / MAX_PERCENT;
	const lightness = hsl.lightness / MAX_PERCENT;

	return {
		alpha: getAlphaValue((value as HSLAColor).alpha ?? ALPHA_FULL_VALUE),
		blue: getHexValue(Math.round(getHexyValue(hue, lightness, saturation, 4))),
		green: getHexValue(Math.round(getHexyValue(hue, lightness, saturation, 8))),
		red: getHexValue(Math.round(getHexyValue(hue, lightness, saturation, 0))),
	};
}

function getHexyValue(hue: number, lightness: number, saturation: number, value: number): number {
	const part = (value + hue / 30) % 12;
	const mod = saturation * Math.min(lightness, 1 - lightness);

	return (lightness - mod * Math.max(-1, Math.min(part - 3, 9 - part, 1))) * MAX_HEX;
}

export function getHslValue(value: Record<keyof HSLColor, unknown>): HSLColor {
	return {
		hue: getDegrees(value.hue),
		lightness: getPercentage(value.lightness),
		saturation: getPercentage(value.saturation),
	};
}

export function hslToHex(hsl: HSLAColor | HSLColor, alpha?: boolean): string {
	return convertRgbToHex(convertHslToRgba(hsl), alpha ?? false);
}

/**
 * Convert an HSL(A) color to an RGB color
 *
 * Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L61
 * @param hsl HSL(A) color
 * @returns RGB color
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
 * Convert an HSL(A) color to an RGBA color
 *
 * Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L61
 * @param hsl HSL(A) color
 * @returns RGBA color
 */
export function hslToRgba(hsl: HSLAColor | HSLColor): RGBAColor {
	return convertHslToRgba(hsl);
}

// #endregion
