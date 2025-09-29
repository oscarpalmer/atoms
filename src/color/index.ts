import {
	HEX_BLACK,
	HEX_WHITE,
	MAX_HEX,
	SRGB_LUMINANCE_BLUE,
	SRGB_LUMINANCE_EXPONENT,
	SRGB_LUMINANCE_GREEN,
	SRGB_LUMINANCE_MINIMUM,
	SRGB_LUMINANCE_MODIFIER,
	SRGB_LUMINANCE_MULTIPLIER,
	SRGB_LUMINANCE_OFFSET,
	SRGB_LUMINANCE_RED,
	SRGB_LUMINANCE_THRESHOLD,
} from './constants';
import {isColor, isHexColor, isHSLColor, isRGBColor} from './is';
import {getNormalizedHex} from './misc';
import type {ColorState, HSLColor, RGBColor} from './models';
import {getState} from './state';
import {hexToRgb, hslToRgb, rgbToHex, rgbToHsl} from './value';

class Color {
	private declare readonly $color: boolean;

	readonly #state: ColorState;

	/**
	 * Get the color as a hex-color
	 */
	get hex(): string {
		return this.#state.hex;
	}

	/**
	 * Set colors from a hex-color
	 */
	set hex(value: string) {
		if (isHexColor(value) && value !== this.#state.hex) {
			const hex = getNormalizedHex(value);
			const rgb = hexToRgb(hex);

			this.#state.hex = hex;
			this.#state.hsl = rgbToHsl(rgb);
			this.#state.rgb = rgb;
		}
	}

	/**
	 * Get the color as an HSL-color
	 */
	get hsl(): HSLColor {
		return this.#state.hsl;
	}

	/**
	 * Set colors from an HSL-color
	 */
	set hsl(value: HSLColor) {
		if (isHSLColor(value)) {
			const rgb = hslToRgb(value);

			this.#state.hex = rgbToHex(rgb);
			this.#state.hsl = value;
			this.#state.rgb = rgb;
		}
	}

	/**
	 * Get the color as an RGB-color
	 */
	get rgb(): RGBColor {
		return this.#state.rgb;
	}

	/**
	 * Set colors from an RGB-color
	 */
	set rgb(value: RGBColor) {
		if (isRGBColor(value)) {
			this.#state.hex = rgbToHex(value);
			this.#state.hsl = rgbToHsl(value);
			this.#state.rgb = value;
		}
	}

	constructor(value: unknown) {
		this.#state = getState(value);

		Object.defineProperty(this, '$color', {
			value: true,
		});
	}
}

/**
 * Get a color from any kind of value
 * @param value Original value
 * @returns Color instance
 */
export function getColor(value: unknown): Color {
	return isColor(value) ? value : new Color(value);
}

/**
 * Get a foreground color _(usually text)_ based on a background color's luminance
 * @param value Original value
 * @returns Color instance
 */
export function getForegroundColor(value: unknown): Color {
	const original = getColor(value);
	const {blue, green, red} = original.rgb;

	const values = [blue / MAX_HEX, green / MAX_HEX, red / MAX_HEX];

	for (let color of values) {
		if (color <= SRGB_LUMINANCE_MINIMUM) {
			color /= SRGB_LUMINANCE_MULTIPLIER;
		} else {
			color =
				((color + SRGB_LUMINANCE_OFFSET) / SRGB_LUMINANCE_MODIFIER) **
				SRGB_LUMINANCE_EXPONENT;
		}
	}

	const luminance =
		SRGB_LUMINANCE_RED * values[2] +
		SRGB_LUMINANCE_GREEN * values[1] +
		SRGB_LUMINANCE_BLUE * values[0];

	// Rudimentary and ureliable?; implement APCA for more reliable results?
	return getColor(luminance > SRGB_LUMINANCE_THRESHOLD ? HEX_BLACK : HEX_WHITE);
}

/**
 * Get the hex-color from any kind of value
 * @param value Original value
 * @returns Hex-color string
 */
export function getHexColor(value: unknown): string {
	return getColor(value).hex;
}

/**
 * Get the HSL-color from any kind of value
 * @param value Original value
 * @returns HSLColor object
 */
export function getHSLColor(value: unknown): HSLColor {
	return getColor(value).hsl;
}

/**
 * Get the RGB-color from any kind of value
 * @param value Original value
 * @returns RGBColor object
 */
export function getRGBColor(value: unknown): RGBColor {
	return getColor(value).rgb;
}

export {
	isColor,
	isHexColor,
	isHSLColor,
	isRGBColor,
	type Color,
	type HSLColor,
	type RGBColor,
};
