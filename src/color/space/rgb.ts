import {join} from '../../internal/string';
import {ALPHA_FULL_VALUE, DEFAULT_RGB, MAX_HEX, MAX_PERCENT} from '../constants';
import {getAlpha, getAlphaValue} from '../misc/alpha';
import {getHexValue} from '../misc/get';
import {isRgbLike} from '../misc/is';
import type {HSLAColor, HSLColor, RGBAColor, RGBColor} from '../models';

export function convertRgbToHex(rgb: RGBAColor | RGBColor, alpha: boolean): string {
	const hex = `${join(
		[rgb.red, rgb.green, rgb.blue].map(color => {
			const hex = color.toString(16);

			return hex.length === 1 ? `0${hex}` : hex;
		}),
	)}`;

	let a = '';

	if (typeof alpha === 'boolean' && alpha) {
		a = getAlpha((rgb as RGBAColor).alpha).hex;
	}

	return `${hex}${a}`;
}

export function convertRgbToHsla(value: unknown): HSLAColor {
	const rgb = isRgbLike(value) ? getRgbValue(value) : {...DEFAULT_RGB};

	const blue = rgb.blue / MAX_HEX;
	const green = rgb.green / MAX_HEX;
	const red = rgb.red / MAX_HEX;

	const max = Math.max(blue, green, red);
	const min = Math.min(blue, green, red);

	const delta = max - min;
	const lightness = (min + max) / 2;

	let hue = 0;
	let saturation = 0;

	if (delta !== 0) {
		saturation = (max - lightness) / Math.min(lightness, 1 - lightness);

		switch (max) {
			case blue:
				hue = (red - green) / delta + 4;
				break;

			case green:
				hue = (blue - red) / delta + 2;
				break;

			case red:
				hue = (green - blue) / delta + (green < blue ? 6 : 0);
				break;
		}

		hue *= 60;
	}

	return {
		alpha: getAlphaValue((value as RGBAColor).alpha ?? ALPHA_FULL_VALUE),
		hue: +hue.toFixed(2),
		lightness: +(lightness * MAX_PERCENT).toFixed(2),
		saturation: +(saturation * MAX_PERCENT).toFixed(2),
	};
}

export function getRgbValue(value: Record<keyof RGBColor, unknown>): RGBColor {
	return {
		blue: getHexValue((value as RGBColor).blue),
		green: getHexValue((value as RGBColor).green),
		red: getHexValue((value as RGBColor).red),
	};
}

/**
 * Convert an RGB(A) color to a hex color _(with optional alpha channel)_
 * @param rgb RGB(A) color
 * @param alpha Include alpha channel? _(defaults to `false`)_
 * @returns Hex color
 */
export function rgbToHex(rgb: RGBAColor | RGBColor, alpha?: boolean): string {
	return convertRgbToHex(isRgbLike(rgb) ? getRgbValue(rgb) : {...DEFAULT_RGB}, alpha ?? false);
}

/**
 * Convert an RGB(A) color to an HSL color
 *
 * Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L26
 * @param rgb RGB(A) color
 * @returns HSL color
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
 * Convert an RGB(A) color to an HSLA color
 *
 * Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L26
 * @param rgb RGB(A) color
 * @returns HSLA color
 */
export function rgbToHsla(rgb: RGBAColor | RGBColor): HSLAColor {
	return convertRgbToHsla(rgb);
}
