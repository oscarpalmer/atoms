import {clamp} from '../internal/number';
import {
	DEFAULT_HSL,
	DEFAULT_RGB,
	HEX_BLACK,
	MAX_DEGREE,
	MAX_HEX,
	MAX_PERCENT,
} from './constants';
import {isHSLColor, isRGBColor} from './is';
import {getNormalizedHex} from './misc';
import type {ColorState, HSLColor, RGBColor} from './models';
import {hexToRgb, hslToRgb, rgbToHex, rgbToHsl} from './value';

export function getState(value: unknown): ColorState {
	if (typeof value === 'string') {
		const hex = getNormalizedHex(value);
		const rgb = hexToRgb(hex);

		return {
			hex,
			rgb,
			hsl: rgbToHsl(rgb),
		};
	}

	const state: Partial<ColorState> = {};

	if (typeof value === 'object' && value !== null) {
		if (isHSLColor(value)) {
			state.hsl = {
				hue: clamp(value.hue, 0, MAX_DEGREE),
				lightness: clamp(value.lightness, 0, MAX_PERCENT),
				saturation: clamp(value.saturation, 0, MAX_PERCENT),
			};

			state.rgb = hslToRgb(state.hsl as HSLColor);
			state.hex = rgbToHex(state.rgb as RGBColor);

			return state as ColorState;
		}

		if (isRGBColor(value)) {
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

	state.hex = String(HEX_BLACK);
	state.hsl = {...DEFAULT_HSL};
	state.rgb = {...DEFAULT_RGB};

	return state as ColorState;
}
