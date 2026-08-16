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
import {getNormalizedHex, hexToRgb} from '../space/hex';
import {getHslValue, hslToHwb, hslToRgb} from '../space/hsl';
import {getHwbValue, hwbToHex, hwbToHsl, hwbToRgb} from '../space/hwb';
import {getRgbValue, rgbToHex, rgbToHsl, rgbToHwb} from '../space/rgb';
import {getAlpha} from './alpha';
import {getDegrees, getHexValue, getPercentage} from './get';
import {isColor, isHexColor, isHslLike, isHwbLike, isRgbLike} from './is';

// #region Functions

export function getColorState(value: unknown): ColorState {
	if (typeof value === 'string') {
		const normalized = getNormalizedHex(value, true);
		const hex = normalized.slice(0, LENGTH_LONG);
		const rgb = hexToRgb(hex);

		return {
			hex,
			rgb,
			alpha: getAlpha(normalized.slice(LENGTH_LONG)),
			hsl: rgbToHsl(rgb),
			hwb: rgbToHwb(rgb),
		};
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
			state.hsl = getHslValue(value as Record<keyof HSLColor, unknown>);
			state.rgb = hslToRgb(state.hsl);
			state.hex = rgbToHex(state.rgb);
			state.hwb = hslToHwb(state.hsl);

			return state as ColorState;
		}

		if (KEYS_HWB.every(key => key in value)) {
			state.hwb = getHwbValue(value as Record<keyof HWBColor, unknown>);
			state.hex = hwbToHex(state.hwb);
			state.hsl = hwbToHsl(state.hwb);
			state.rgb = hwbToRgb(state.hwb);

			return state as ColorState;
		}

		if (KEYS_RGB.every(key => key in value)) {
			state.rgb = getRgbValue(value as Record<keyof RGBColor, unknown>);
			state.hex = rgbToHex(state.rgb);
			state.hsl = rgbToHsl(state.rgb);
			state.hwb = rgbToHwb(state.rgb);

			return state as ColorState;
		}
	}

	state.alpha ??= getAlpha(MAX_PERCENT);
	state.hex ??= HEX_BLACK;
	state.hsl ??= {...DEFAULT_HSL};
	state.hwb ??= {...DEFAULT_HWB};
	state.rgb ??= {...DEFAULT_RGB};

	return state as ColorState;
}

export function setHexColor(state: ColorState, value: string, alpha: boolean): void {
	if (!isHexColor(value) || (!alpha && value === state.hex)) {
		return;
	}

	const normalized = getNormalizedHex(value, true);
	const hex = normalized.slice(0, LENGTH_LONG);
	const rgb = hexToRgb(hex);

	state.hex = hex;
	state.hsl = rgbToHsl(rgb);
	state.rgb = rgb;

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
		lightness: getPercentage((value as HSLColor).lightness),
		saturation: getPercentage((value as HSLColor).saturation),
	};

	const rgb = hslToRgb(hsl);

	state.hex = rgbToHex(rgb);
	state.hsl = hsl;
	state.rgb = rgb;

	if (alpha) {
		state.alpha = getAlpha((value as HSLAColor).alpha);
	}
}

export function setHWBColor(state: ColorState, value: unknown, alpha: boolean): void {
	if (!isHwbLike(value)) {
		return;
	}

	const hwb = {
		blackness: getPercentage((value as HWBColor).blackness),
		hue: getDegrees((value as HWBColor).hue),
		whiteness: getPercentage((value as HWBColor).whiteness),
	};

	const hsl = hwbToHsl(hwb);
	const rgb = hslToRgb(hsl);

	state.hex = rgbToHex(rgb);
	state.hsl = hsl;
	state.hwb = hwb;
	state.rgb = rgb;

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

	state.hex = rgbToHex(rgb);
	state.hsl = rgbToHsl(rgb);
	state.rgb = rgb;

	if (alpha) {
		state.alpha = getAlpha((value as RGBAColor).alpha);
	}
}

// #endregion
