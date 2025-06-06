import {getState} from './get';
import {isColor, isHSLColor, isHexColor, isRGBColor} from './is';
import {getNormalizedHex} from './misc';
import type {ColorState, HSLColor, RGBColor} from './models';
import {hexToRgb, hslToRgb, rgbToHex, rgbToHsl} from './value';

export class Color {
	private readonly $color = true;

	private readonly state: ColorState;

	/**
	 * Get the color as a hex-color
	 */
	get hex(): string {
		return this.state.hex;
	}

	/**
	 * Set colors from a hex-color
	 */
	set hex(value: string) {
		if (isHexColor(value) && value !== this.state.hex) {
			const hex = getNormalizedHex(value);
			const rgb = hexToRgb(hex);

			this.state.hex = hex;
			this.state.hsl = rgbToHsl(rgb);
			this.state.rgb = rgb;
		}
	}

	/**
	 * Get the color as an HSL-color
	 */
	get hsl(): HSLColor {
		return this.state.hsl;
	}

	set hsl(value: HSLColor) {
		if (isHSLColor(value)) {
			const rgb = hslToRgb(value);

			this.state.hex = rgbToHex(rgb);
			this.state.hsl = value;
			this.state.rgb = rgb;
		}
	}

	/**
	 * Get the color as an RGB-color
	 */
	get rgb(): RGBColor {
		return this.state.rgb;
	}

	set rgb(value: RGBColor) {
		if (isRGBColor(value)) {
			this.state.hex = rgbToHex(value);
			this.state.hsl = rgbToHsl(value);
			this.state.rgb = value;
		}
	}

	constructor(value: unknown) {
		this.state = getState(value);
	}
}

/**
 * Get a color from any kind of value
 */
export function getColor(value: unknown): Color {
	return isColor(value) ? value : new Color(value);
}

/**
 * Get a foreground color _(usually text)_ based on a background color's luminance
 */
export function getForegroundColor(value: unknown): Color {
	const original = getColor(value);
	const {blue, green, red} = original.rgb;

	const values = [blue / 255, green / 255, red / 255];

	for (let color of values) {
		if (color <= 0.03928) {
			color /= 12.92;
		} else {
			color = ((color + 0.055) / 1.055) ** 2.4;
		}
	}

	const luminance =
		0.2126 * values[2] + 0.7152 * values[1] + 0.0722 * values[0];

	// Rudimentary and ureliable?; implement APCA for more reliable results?
	return getColor(luminance > 0.625 ? '000000' : 'ffffff');
}

/**
 * Get the hex-color from any kind of value
 */
export function getHexColor(value: unknown): string {
	return getColor(value).hex;
}

/**
 * Get the HSL-color from any kind of value
 */
export function getHSLColor(value: unknown): HSLColor {
	return getColor(value).hsl;
}

/**
 * Get the RGB-color from any kind of value
 */
export function getRGBColor(value: unknown): RGBColor {
	return getColor(value).rgb;
}

export {isColor, isHSLColor, isHexColor, isRGBColor};
