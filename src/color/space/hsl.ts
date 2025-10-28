import {clamp} from '../../number';
import {
	ALPHA_FULL_VALUE,
	DEFAULT_HSL,
	MAX_DEGREE,
	MAX_HEX,
	MAX_PERCENT,
} from '../constants';
import {getAlphaValue} from '../misc/alpha';
import {isHslColor} from '../misc/is';
import {getState} from '../misc/state';
import type {HSLAColor, HSLColor, RGBAColor, RGBColor} from '../models';
import {convertRgbToHex} from './rgb';

function convertHslToRgba(hsl: HSLAColor | HSLColor): RGBAColor {
	const actual = isHslColor(hsl) ? hsl : {...DEFAULT_HSL};

	let hue = actual.hue % MAX_DEGREE;

	if (hue < 0) {
		hue += MAX_DEGREE;
	}

	const saturation = actual.saturation / MAX_PERCENT;
	const lightness = actual.lightness / MAX_PERCENT;

	return {
		alpha: getAlphaValue((hsl as HSLAColor).alpha ?? ALPHA_FULL_VALUE),
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
 * Get the HSLA color from any kind of value
 * @param value Original value
 * @returns HSLA color
 */
export function getHslaColor(value: unknown): HSLAColor {
	const {alpha, hsl} = getState(value);

	return {
		...hsl,
		alpha: alpha.value,
	};
}

/**
 * Get the HSL color from any kind of value
 * @param value Original value
 * @returns HSL color
 */
export function getHslColor(value: unknown): HSLColor {
	return getState(value).hsl;
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
