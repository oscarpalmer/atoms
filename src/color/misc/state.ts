import {
	ALPHA_FULL_VALUE,
	DEFAULT_HSL,
	DEFAULT_RGB,
	HEX_BLACK,
	KEYS_HSL,
	KEYS_RGB,
	LENGTH_LONG,
} from '../constants';
import type {ColorState, HSLAColor, HSLColor, RGBAColor, RGBColor} from '../models';
import {getNormalizedHex, hexToRgb} from '../space/hex';
import {getHslValue, hslToRgb} from '../space/hsl';
import {getRgbValue, rgbToHex, rgbToHsl} from '../space/rgb';
import {getAlpha} from './alpha';
import {getHexValue, getDegrees, getPercentage} from './get';
import {isColor, isHexColor, isHslLike, isRgbLike} from './is';

export function getState(value: unknown): ColorState {
	if (typeof value === 'string') {
		const normalized = getNormalizedHex(value, true);
		const hex = normalized.slice(0, LENGTH_LONG);
		const rgb = hexToRgb(hex);

		return {
			hex,
			rgb,
			alpha: getAlpha(normalized.slice(LENGTH_LONG)),
			hsl: rgbToHsl(rgb),
		};
	}

	if (isColor(value)) {
		return {
			hex: value.hex,
			hsl: value.hsl,
			rgb: value.rgb,
			alpha: getAlpha(value.alpha),
		};
	}

	const state: Partial<ColorState> = {};

	if (typeof value === 'object' && value !== null) {
		state.alpha = getAlpha((value as HSLAColor).alpha);

		if (KEYS_HSL.every(key => key in value)) {
			state.hsl = getHslValue(value as Record<keyof HSLColor, unknown>);
			state.rgb = hslToRgb(state.hsl as HSLColor);
			state.hex = rgbToHex(state.rgb as RGBColor);

			return state as ColorState;
		}

		if (KEYS_RGB.every(key => key in value)) {
			state.rgb = getRgbValue(value as Record<keyof RGBColor, unknown>);
			state.hex = rgbToHex(state.rgb as RGBColor);
			state.hsl = rgbToHsl(state.rgb as RGBColor);

			return state as ColorState;
		}
	}

	state.alpha ??= getAlpha(ALPHA_FULL_VALUE);
	state.hex ??= String(HEX_BLACK);
	state.hsl ??= {...DEFAULT_HSL};
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
