import {clamp} from '../../internal/number';
import {
	ALPHA_FULL_VALUE,
	DEFAULT_HSL,
	DEFAULT_RGB,
	HEX_BLACK,
	LENGTH_LONG,
	MAX_DEGREE,
	MAX_HEX,
	MAX_PERCENT,
} from '../constants';
import type {
	ColorState,
	HSLAColor,
	HSLColor,
	RGBAColor,
	RGBColor,
} from '../models';
import {getNormalizedHex, hexToRgb} from '../space/hex';
import {hslToRgb} from '../space/hsl';
import {rgbToHex, rgbToHsl} from '../space/rgb';
import {getAlpha} from './alpha';
import {isColor, isHexColor, isHslColor, isRgbColor} from './is';

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

		if (isHslColor(value)) {
			state.hsl = {
				hue: clamp(value.hue, 0, MAX_DEGREE),
				lightness: clamp(value.lightness, 0, MAX_PERCENT),
				saturation: clamp(value.saturation, 0, MAX_PERCENT),
			};

			state.rgb = hslToRgb(state.hsl as HSLColor);
			state.hex = rgbToHex(state.rgb as RGBColor);

			return state as ColorState;
		}

		if (isRgbColor(value)) {
			state.rgb = {
				blue: clamp(value.blue, 0, MAX_HEX),
				green: clamp(value.green, 0, MAX_HEX),
				red: clamp(value.red, 0, MAX_HEX),
			};

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

export function setHexColor(
	state: ColorState,
	value: string,
	alpha: boolean,
): void {
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

export function setHSLColor(
	state: ColorState,
	value: unknown,
	alpha: boolean,
): void {
	if (!isHslColor(value)) {
		return;
	}

	const rgb = hslToRgb(value);

	state.hex = rgbToHex(rgb);
	state.hsl = value;
	state.rgb = rgb;

	if (alpha) {
		state.alpha = getAlpha((value as HSLAColor).alpha);
	}
}

export function setRGBColor(
	state: ColorState,
	value: unknown,
	alpha: boolean,
): void {
	if (!isRgbColor(value)) {
		return;
	}

	state.hex = rgbToHex(value);
	state.hsl = rgbToHsl(value);
	state.rgb = value;

	if (alpha) {
		state.alpha = getAlpha((value as RGBAColor).alpha);
	}
}
