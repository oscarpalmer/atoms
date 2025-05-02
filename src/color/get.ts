import {clamp} from '../internal/number';
import {defaultHex, defaultHsl, defaultRgb} from './constants';
import {isHSLColor, isRGBColor} from './is';
import {getNormalizedHex} from './misc';
import type {ColorState, HSLColor, RGBColor} from './models';
import {hexToRgb, hslToRgb, rgbToHex, rgbToHsl} from './value';

/**
 * Get color state from any kind of value
 */
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
				hue: clamp(value.hue, 0, 360),
				lightness: clamp(value.lightness, 0, 100),
				saturation: clamp(value.saturation, 0, 100),
			};

			state.rgb = hslToRgb(state.hsl as HSLColor);
			state.hex = rgbToHex(state.rgb as RGBColor);

			return state as ColorState;
		}

		if (isRGBColor(value)) {
			state.rgb = {
				blue: clamp(value.blue, 0, 255),
				green: clamp(value.green, 0, 255),
				red: clamp(value.red, 0, 255),
			};

			state.hex = rgbToHex(state.rgb as RGBColor);
			state.hsl = rgbToHsl(state.rgb as RGBColor);

			return state as ColorState;
		}
	}

	state.hex = String(defaultHex);
	state.hsl = {...defaultHsl};
	state.rgb = {...defaultRgb};

	return state as ColorState;
}
