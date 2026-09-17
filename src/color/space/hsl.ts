import {COLOR_DEFAULTS, COLOR_MAX, COLOR_TYPE} from '../constants';
import {getAlphaValue} from '../misc/alpha';
import {getDegrees, getHexValue, getPercentage} from '../misc/get';
import {isHslLike} from '../misc/is';
import {getStateValue, setStateValue} from '../misc/state';
import type {
	ColorState,
	ColorType,
	HSLAColor,
	HSLColor,
	HWBAColor,
	HWBColor,
	InternalColor,
	RGBAColor,
	RGBColor,
} from '../models';
import {convertRgbToHex} from './rgb';

// #region Functions

function convertHslToHwba(input: unknown): HWBAColor {
	const hsl = isHslLike(input) ? getHslValues(input) : {...COLOR_DEFAULTS.hsl};

	let {hue, lightness, saturation} = hsl;

	lightness /= COLOR_MAX.percent;
	saturation /= COLOR_MAX.percent;

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
		whiteness: whiteness * COLOR_MAX.percent,
		blackness: blackness * COLOR_MAX.percent,
		alpha: getAlphaValue((input as HSLAColor)?.alpha ?? COLOR_MAX.percent),
	};
}

function convertHslToRgba(input: unknown): RGBAColor {
	const hsl = isHslLike(input) ? getHslValues(input) : {...COLOR_DEFAULTS.hsl};

	const hue = hsl.hue % COLOR_MAX.degree;
	const saturation = hsl.saturation / COLOR_MAX.percent;
	const lightness = hsl.lightness / COLOR_MAX.percent;

	return {
		alpha: getAlphaValue((input as HSLAColor)?.alpha ?? COLOR_MAX.percent),
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
		case COLOR_TYPE.hex:
			state.hex = hslToHex(state.hsl!);
			break;

		case COLOR_TYPE.hwb:
			state.hwb = hslToHwb(state.hsl!);
			break;

		case COLOR_TYPE.rgb:
			state.rgb = hslToRgb(state.hsl!);
			break;
	}

	return state[type]!;
}

function getHexyValue(hue: number, lightness: number, saturation: number, value: number): number {
	const part = (value + hue / 30) % 12;
	const mod = saturation * Math.min(lightness, 1 - lightness);

	return (lightness - mod * Math.max(-1, Math.min(part - 3, 9 - part, 1))) * COLOR_MAX.hex;
}

export function getHslValue(this: InternalColor): HSLColor {
	return getStateValue(this, COLOR_TYPE.hsl, false) as HSLColor;
}

export function getHslaValue(this: InternalColor): HSLAColor {
	return getStateValue(this, COLOR_TYPE.hsl, true) as HSLAColor;
}

export function getHslValues(value: Record<keyof HSLColor, unknown>): HSLColor {
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

export function setHslValue(this: InternalColor, value: unknown): void {
	setHSLValueInState(this, value, false);
}

function setHSLValueInState(instance: InternalColor, value: unknown, alpha: boolean): void {
	if (!isHslLike(value)) {
		return;
	}

	setStateValue(
		instance,
		COLOR_TYPE.hsl,
		{
			hue: getDegrees(value.hue),
			saturation: getPercentage(value.saturation),
			lightness: getPercentage(value.lightness),
		},
		alpha ? (value as HSLAColor).alpha : undefined,
	);
}

export function setHslaValue(this: InternalColor, value: unknown): void {
	setHSLValueInState(this, value, true);
}

// #endregion
