import {
	DEFAULT_HSL,
	DEFAULT_HWB,
	DEFAULT_RGB,
	HEX_BLACK,
	KEYS_HSL,
	KEYS_HWB,
	KEYS_RGB,
	LENGTH_LONG,
	MAX_PERCENT,
} from '../constants';
import type {
	ColorState,
	HSLAColor,
	HSLColor,
	HWBAColor,
	HWBColor,
	RGBAColor,
	RGBColor,
} from '../models';
import {getNormalizedHex, hexToHsl, hexToRgb} from '../space/hex';
import {getHslValue, hslToHex, hslToHwb, hslToRgb} from '../space/hsl';
import {getHwbValue, hwbToHex, hwbToHsl, hwbToRgb} from '../space/hwb';
import {getRgbValue, rgbToHex, rgbToHsl, rgbToHwb} from '../space/rgb';
import {getAlpha} from './alpha';
import {getDegrees, getHexValue, getPercentage} from './get';
import {isColor, isHexColor, isHslLike, isHwbLike, isRgbLike} from './is';

// #region Functions

export function getColorState(value: unknown): ColorState {
	if (typeof value === 'string') {
		return getColorStateForHex(value);
	}

	if (isColor(value)) {
		return {
			hex: value.hex,
			hsl: value.hsl,
			hwb: value.hwb,
			rgb: value.rgb,
			alpha: getAlpha(value.alpha),
		};
	}

	const state: Partial<ColorState> = {};

	if (typeof value === 'object' && value !== null) {
		state.alpha = getAlpha((value as HSLAColor).alpha);

		if (KEYS_HSL.every(key => key in value)) {
			return getColorStateForHsl(state, value as Record<keyof HSLColor, unknown>);
		}

		if (KEYS_HWB.every(key => key in value)) {
			return getColorStateForHwb(state, value as Record<keyof HWBColor, unknown>);
		}

		if (KEYS_RGB.every(key => key in value)) {
			return getColorStateForRgb(state, value as Record<keyof RGBColor, unknown>);
		}
	}

	return getDefaultColorState(state);
}

function getColorStateForHex(value: string): ColorState {
	const normalized = getNormalizedHex(value, true);
	const hex = normalized.slice(0, LENGTH_LONG);

	const hsl = hexToHsl(hex);

	return {
		hex,
		hsl,
		alpha: getAlpha(normalized.slice(LENGTH_LONG)),
		hwb: hslToHwb(hsl),
		rgb: hslToRgb(hsl),
	};
}

function getColorStateForHsl(
	state: Partial<ColorState>,
	value: Record<keyof HSLColor, unknown>,
): ColorState {
	state.hsl = getHslValue(value);

	state.rgb = hslToRgb(state.hsl);
	state.hex = hslToHex(state.hsl);
	state.hwb = hslToHwb(state.hsl);

	return state as ColorState;
}

function getColorStateForHwb(
	state: Partial<ColorState>,
	value: Record<keyof HWBColor, unknown>,
): ColorState {
	state.hwb = getHwbValue(value);

	state.hsl = hwbToHsl(state.hwb);
	state.rgb = hwbToRgb(state.hwb);
	state.hex = hwbToHex(state.hwb);

	return state as ColorState;
}

function getColorStateForRgb(
	state: Partial<ColorState>,
	value: Record<keyof RGBColor, unknown>,
): ColorState {
	state.rgb = getRgbValue(value);

	state.hex = rgbToHex(state.rgb);
	state.hsl = rgbToHsl(state.rgb);
	state.hwb = rgbToHwb(state.rgb);

	return state as ColorState;
}

function getDefaultColorState(state: Partial<ColorState>): ColorState {
	state.alpha = getAlpha(MAX_PERCENT);
	state.hex = HEX_BLACK;
	state.hsl = {...DEFAULT_HSL};
	state.hwb = {...DEFAULT_HWB};
	state.rgb = {...DEFAULT_RGB};

	return state as ColorState;
}

export function setHexColor(state: ColorState, value: string, alpha: boolean): void {
	if (!isHexColor(value) || (!alpha && value === state.hex)) {
		return;
	}

	const normalized = getNormalizedHex(value, true);
	const hex = normalized.slice(0, LENGTH_LONG);
	const hsl = hexToHsl(hex);

	state.hex = hex;
	state.hsl = hsl;

	state.rgb = hslToRgb(hsl);
	state.hwb = hslToHwb(hsl);

	if (alpha) {
		state.alpha = getAlpha(normalized.slice(LENGTH_LONG));
	}
}

export function setHSLColor(state: ColorState, value: unknown, alpha: boolean): void {
	if (!isHslLike(value)) {
		return;
	}

	const hsl = {
		hue: getDegrees((value as HSLColor).hue),
		saturation: getPercentage((value as HSLColor).saturation),
		lightness: getPercentage((value as HSLColor).lightness),
	};

	state.hsl = hsl;

	state.hex = hslToHex(hsl);
	state.hwb = hslToHwb(hsl);
	state.rgb = hslToRgb(hsl);

	if (alpha) {
		state.alpha = getAlpha((value as HSLAColor).alpha);
	}
}

export function setHWBColor(state: ColorState, value: unknown, alpha: boolean): void {
	if (!isHwbLike(value)) {
		return;
	}

	const hwb = {
		hue: getDegrees((value as HWBColor).hue),
		whiteness: getPercentage((value as HWBColor).whiteness),
		blackness: getPercentage((value as HWBColor).blackness),
	};

	state.hwb = hwb;

	state.hex = hwbToHex(hwb);
	state.hsl = hwbToHsl(hwb);
	state.rgb = hwbToRgb(hwb);

	if (alpha) {
		state.alpha = getAlpha((value as HWBAColor).alpha);
	}
}

export function setRGBColor(state: ColorState, value: unknown, alpha: boolean): void {
	if (!isRgbLike(value)) {
		return;
	}

	const rgb = {
		blue: getHexValue((value as RGBColor).blue),
		green: getHexValue((value as RGBColor).green),
		red: getHexValue((value as RGBColor).red),
	};

	const hsl = rgbToHsl(rgb);

	state.hsl = hsl;
	state.rgb = rgb;

	state.hex = hslToHex(hsl);
	state.hwb = hslToHwb(hsl);

	if (alpha) {
		state.alpha = getAlpha((value as RGBAColor).alpha);
	}
}

// #endregion
