import {join} from '../../internal/string';
import {
	ALPHA_FULL_VALUE,
	DEFAULT_RGB,
	MAX_DEGREE,
	MAX_HEX,
	MAX_PERCENT,
} from '../constants';
import {getAlpha, getAlphaValue} from '../misc/alpha';
import {isRgbColor} from '../misc/is';
import type {HSLAColor, HSLColor, RGBAColor, RGBColor} from '../models';

export function convertRgbToHex(
	rgb: RGBAColor | RGBColor,
	alpha: boolean,
): string {
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

export function convertRgbToHsla(rgb: RGBAColor | RGBColor): HSLAColor {
	const actual = isRgbColor(rgb) ? rgb : {...DEFAULT_RGB};

	const blue = actual.blue / MAX_HEX;
	const green = actual.green / MAX_HEX;
	const red = actual.red / MAX_HEX;

	const max = Math.max(blue, green, red);
	const min = Math.min(blue, green, red);

	const delta = max - min;
	const lightness = (min + max) / 2;

	let hue = 0;
	let saturation = 0;

	if (delta !== 0) {
		saturation =
			lightness === 0 || lightness === 1
				? 0
				: (max - lightness) / Math.min(lightness, 1 - lightness);

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

			default:
				/* istanbul ignore next */
				break;
		}

		hue *= 60;
	}

	if (saturation < 0) {
		hue += MAX_DEGREE / 2;
		saturation = Math.abs(saturation);
	}

	if (hue >= MAX_DEGREE) {
		hue -= MAX_DEGREE;
	}

	return {
		alpha: getAlphaValue((rgb as RGBAColor).alpha ?? ALPHA_FULL_VALUE),
		hue: +hue.toFixed(2),
		lightness: +(lightness * MAX_PERCENT).toFixed(2),
		saturation: +(saturation * MAX_PERCENT).toFixed(2),
	};
}

/**
 * Convert an RGB(A) color to a hex color _(with optional alpha channel)_
 * @param rgb RGB(A) color
 * @param alpha Include alpha channel? _(defaults to `false`)_
 * @returns Hex color
 */
export function rgbToHex(rgb: RGBAColor | RGBColor, alpha?: boolean): string {
	return convertRgbToHex(
		isRgbColor(rgb) ? rgb : {...DEFAULT_RGB},
		alpha ?? false,
	);
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
