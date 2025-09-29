import {clamp} from '../internal/number';
import {join} from '../internal/string';
import {
	EXPRESSION_GROUPED,
	MAX_DEGREE,
	MAX_HEX,
	MAX_PERCENT,
} from './constants';
import type {HSLColor, RGBColor} from './models';

function getHexyValue(
	hue: number,
	lightness: number,
	saturation: number,
	value: number,
): number {
	const part = (value + hue / 30) % 12;
	const mod = saturation * Math.min(lightness, 1 - lightness);

	return (
		(lightness - mod * Math.max(-1, Math.min(part - 3, 9 - part, 1))) * MAX_HEX
	);
}

/**
 * Convert a hex-color to an RGB-color
 * @param value Original value
 * @returns RGBColor object
 */
export function hexToRgb(value: string): RGBColor {
	const pairs = EXPRESSION_GROUPED.exec(value) as RegExpExecArray;
	const rgb = [];

	const {length} = pairs;

	for (let index = 1; index < length; index += 1) {
		rgb.push(Number.parseInt(pairs[index], 16));
	}

	return {
		blue: rgb[2],
		green: rgb[1],
		red: rgb[0],
	};
}

/**
 * Convert an HSL-color to an RGB-color
 *
 * Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L61
 * @param value Original value
 * @returns RGBColor object
 */
export function hslToRgb(value: HSLColor): RGBColor {
	let hue = value.hue % MAX_DEGREE;

	if (hue < 0) {
		hue += MAX_DEGREE;
	}

	const saturation = value.saturation / MAX_PERCENT;
	const lightness = value.lightness / MAX_PERCENT;

	return {
		blue: clamp(
			Math.round(getHexyValue(hue, lightness, saturation, 4)),
			0,
			MAX_HEX,
		),
		green: clamp(
			Math.round(getHexyValue(hue, lightness, saturation, 8)),
			0,
			MAX_HEX,
		),
		red: clamp(
			Math.round(getHexyValue(hue, lightness, saturation, 0)),
			0,
			MAX_HEX,
		),
	};
}

/**
 * Convert an RGB-color to a hex-color
 * @param value Original value
 * @returns Hex-color string
 */
export function rgbToHex(value: RGBColor): string {
	return `${join(
		[value.red, value.green, value.blue].map(color => {
			const hex = color.toString(16);

			return hex.length === 1 ? `0${hex}` : hex;
		}),
	)}`;
}

/**
 * Convert an RGB-color to an HSL-color
 *
 * Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L26
 * @param rgb Original value
 * @returns HSLColor object
 */
export function rgbToHsl(rgb: RGBColor): HSLColor {
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

	/* if (saturation < 0) {
		hue += 180;
		saturation = Math.abs(saturation);
	}

	if (hue >= 360) {
		hue -= 360;
	} */

	return {
		hue: +hue.toFixed(2),
		lightness: +(lightness * MAX_PERCENT).toFixed(2),
		saturation: +(saturation * MAX_PERCENT).toFixed(2),
	};
}
