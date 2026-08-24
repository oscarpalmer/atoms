import {COLOR_DEFAULTS, COLOR_MAX, COLOR_TYPE} from '../constants';
import {getAlphaValue} from '../misc/alpha';
import {getDegrees, getPercentage} from '../misc/get';
import {isHwbLike} from '../misc/is';
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
import {hslToRgb, hslToRgba} from './hsl';
import {rgbToHex} from './rgb';

// #region Functions

export function convertHwbToHsl(input: HWBAColor | HWBColor): HSLAColor {
	let {blackness, hue, whiteness} = isHwbLike(input) ? getHwbValue(input) : COLOR_DEFAULTS.hwb;

	blackness /= COLOR_MAX.percent;
	whiteness /= COLOR_MAX.percent;

	if (blackness + whiteness > 1) {
		const total = blackness + whiteness;

		blackness /= total;
		whiteness /= total;
	}

	const lightness = (1 - blackness + whiteness) / 2;

	const saturation = getHwbSaturation(blackness, whiteness, lightness);

	return {
		hue,
		saturation: saturation * COLOR_MAX.percent,
		lightness: lightness * COLOR_MAX.percent,
		alpha: getAlphaValue((input as HWBAColor)?.alpha ?? COLOR_MAX.percent),
	};
}

export function getColorFromHwb<Type extends ColorType>(
	state: ColorState,
	type: Type,
): NonNullable<ColorState[Type]> {
	switch (type) {
		case COLOR_TYPE.hex:
			state.hex = hwbToHex(state.hwb!);
			break;

		case COLOR_TYPE.hsl:
			state.hsl = hwbToHsl(state.hwb!);
			break;

		case COLOR_TYPE.rgb:
			state.rgb = hwbToRgb(state.hwb!);
			break;
	}

	return state[type]!;
}

function getHwbSaturation(blackness: number, whiteness: number, lightness: number): number {
	const value = 1 - blackness;

	const hue = value - whiteness;

	if (hue <= 0) {
		return 0;
	}

	return hue / Math.min(2 * lightness, 2 - 2 * lightness);
}

export function getHwbValue(value: Record<keyof HWBColor, unknown>): HWBColor {
	return {
		hue: getDegrees(value.hue),
		whiteness: getPercentage(value.whiteness),
		blackness: getPercentage(value.blackness),
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
