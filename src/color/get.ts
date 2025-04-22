import {clamp} from '../number';
import {defaultHex, defaultHsl, defaultRgb, prefixPattern} from './constants';
import {isHSLColor, isHexColor, isRGBColor} from './is';
import type {ColorState, HSLColor, RGBColor} from './models';
import {hexToRgb, hslToRgb, rgbToHex, rgbToHsl} from './value';

/**
 * Try to get the normalized hex-color from a value _(defaults to `#000000`)_
 */
export function getNormalisedHex(value: unknown): string {
	if (!isHexColor(value)) {
		return String(defaultHex);
	}

	const normalized = value.replace(prefixPattern, '');

	return normalized.length === 3
		? normalized
				.split('')
				.map(character => character.repeat(2))
				.join('')
		: normalized;
}

/**
 * Get color state from any kind of value
 */
export function getState(value: unknown): ColorState {
	if (typeof value === 'string') {
		const hex = getNormalisedHex(value);
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
