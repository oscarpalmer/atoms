import {clamp} from '../internal/number';
import {anyPattern, groupedPattern} from './constants';
import {getNormalizedHex} from './misc';
import type {HSLColor, RGBColor} from './models';

function getHexyValue(
	hue: number,
	lightness: number,
	saturation: number,
	value: number,
) {
	const part = (value + hue / 30) % 12;
	const mod = saturation * Math.min(lightness, 1 - lightness);

	return (
		(lightness - mod * Math.max(-1, Math.min(part - 3, 9 - part, 1))) * 255
	);
}

/**
 * Convert a hex-color to an RGB-color
 */
export function hexToRgb(value: string): RGBColor {
	const hex = anyPattern.test(value) ? getNormalizedHex(value) : '';
	const pairs = groupedPattern.exec(hex) ?? [];
	const rgb = [];

	const {length} = pairs;

	for (let index = 1; index < length; index += 1) {
		rgb.push(Number.parseInt(pairs[index], 16));
	}

	return {
		blue: rgb[2] ?? 0,
		green: rgb[1] ?? 0,
		red: rgb[0] ?? 0,
	};
}

/**
 * - Convert an HSL-color to an RGB-color
 * - Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L61
 */
export function hslToRgb(value: HSLColor): RGBColor {
	let hue = value.hue % 360;

	if (hue < 0) {
		hue += 360;
	}

	const saturation = value.saturation / 100;
	const lightness = value.lightness / 100;

	return {
		blue: clamp(
			Math.round(getHexyValue(hue, lightness, saturation, 4)),
			0,
			255,
		),
		green: clamp(
			Math.round(getHexyValue(hue, lightness, saturation, 8)),
			0,
			255,
		),
		red: clamp(Math.round(getHexyValue(hue, lightness, saturation, 0)), 0, 255),
	};
}

/**
 * Convert an RGB-color to a hex-color
 */
export function rgbToHex(value: RGBColor): string {
	return `${[value.red, value.green, value.blue]
		.map(color => {
			const hex = color.toString(16);

			return hex.length === 1 ? `0${hex}` : hex;
		})
		.join('')}`;
}

/**
 * - Convert an RGB-color to an HSL-color
 * - Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L26
 */
export function rgbToHsl(rgb: RGBColor): HSLColor {
	const blue = rgb.blue / 255;
	const green = rgb.green / 255;
	const red = rgb.red / 255;

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
		lightness: +(lightness * 100).toFixed(2),
		saturation: +(saturation * 100).toFixed(2),
	};
}
