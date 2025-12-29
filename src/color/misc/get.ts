import {clamp} from '../../number';
import {
	HEX_BLACK,
	HEX_WHITE,
	MAX_DEGREE,
	MAX_HEX,
	MAX_PERCENT,
	SRGB_LUMINANCE_BLUE,
	SRGB_LUMINANCE_EXPONENT,
	SRGB_LUMINANCE_GREEN,
	SRGB_LUMINANCE_MINIMUM,
	SRGB_LUMINANCE_MODIFIER,
	SRGB_LUMINANCE_MULTIPLIER,
	SRGB_LUMINANCE_OFFSET,
	SRGB_LUMINANCE_RED,
	SRGB_LUMINANCE_THRESHOLD,
} from '../constants';
import {Color} from '../instance';
import type {HSLAColor, HSLColor, RGBAColor, RGBColor} from '../models';
import {getState} from './state';

function getClampedValue(value: unknown, minimum: number, maximum: number): number {
	return typeof value === 'number' ? clamp(value, minimum, maximum) : minimum;
}

/**
 * Get a foreground color _(usually text)_ based on a background color's luminance
 * @param value Original value
 * @returns Foreground color
 */
export function getForegroundColor(value: unknown): Color {
	const state = getState(value);
	const {blue, green, red} = state.rgb;

	const values = [blue / MAX_HEX, green / MAX_HEX, red / MAX_HEX];
	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const color = values[index];

		if (color <= SRGB_LUMINANCE_MINIMUM) {
			values[index] /= SRGB_LUMINANCE_MULTIPLIER;
		} else {
			values[index] =
				((color + SRGB_LUMINANCE_OFFSET) / SRGB_LUMINANCE_MODIFIER) ** SRGB_LUMINANCE_EXPONENT;
		}
	}

	const luminance =
		SRGB_LUMINANCE_RED * values[2] +
		SRGB_LUMINANCE_GREEN * values[1] +
		SRGB_LUMINANCE_BLUE * values[0];

	// Rudimentary and ureliable?; implement APCA for more reliable results?
	return new Color(luminance > SRGB_LUMINANCE_THRESHOLD ? HEX_BLACK : HEX_WHITE);
}

/**
 * Get the hex color _(with alpha channel)_ from any kind of value
 * @param value Original value
 * @returns Hex color
 */
export function getHexaColor(value: unknown): string {
	const {alpha, hex} = getState(value);

	return `${hex}${alpha.hex}`;
}

/**
 * Get the hex color from any kind of value
 * @param value Original value
 * @returns Hex color
 */
export function getHexColor(value: unknown): string {
	return getState(value).hex;
}

export function getHexValue(value: unknown): number {
	return getClampedValue(value, 0, MAX_HEX);
}

export function getDegrees(value: unknown): number {
	return getClampedValue(value, 0, MAX_DEGREE);
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

export function getPercentage(value: unknown): number {
	return getClampedValue(value, 0, MAX_PERCENT);
}

/**
 * Get the RGBA color from any kind of value
 * @param value Original value
 * @returns RGBA color
 */
export function getRgbaColor(value: unknown): RGBAColor {
	const {alpha, rgb} = getState(value);

	return {
		...rgb,
		alpha: alpha.value,
	};
}

/**
 * Get the RGB color from any kind of value
 * @param value Original value
 * @returns RGB color
 */
export function getRgbColor(value: unknown): RGBColor {
	return getState(value).rgb;
}
