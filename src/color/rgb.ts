import {clamp} from '../number';
import {Color} from './base';
import {rgbToHex, rgbToHsl} from './functions';
import type {HexColor} from './hex';
import type {HSLColor} from './hsl';

export type RGBColorValue = {
	blue: number;
	green: number;
	red: number;
};

export class RGBColor extends Color<RGBColorValue> {
	/**
	 * Get the current blue value
	 */
	get blue(): number {
		return +this.state.value.blue;
	}

	/**
	 * Set the current blue value
	 */
	set blue(value: number) {
		this.state.value.blue = clamp(value, 0, 255);
	}

	/**
	 * Get the current green value
	 */
	get green(): number {
		return +this.state.value.green;
	}

	/**
	 * Set the current green value
	 */
	set green(value: number) {
		this.state.value.green = clamp(value, 0, 255);
	}

	/**
	 * Get the current red value
	 */
	get red(): number {
		return +this.state.value.red;
	}

	/**
	 * Set the current red value
	 */
	set red(value: number) {
		this.state.value.red = clamp(value, 0, 255);
	}

	constructor(value: RGBColorValue) {
		super('rgb', value);
	}

	/**
	 * @inheritdoc
	 */
	toHex(): HexColor {
		return RGBColor.toHex(this.value);
	}

	/**
	 * Convert the color to an HSL-color
	 */
	toHsl(): HSLColor {
		return RGBColor.toHsl(this.value);
	}

	/**
	 * @inheritdoc
	 */
	toString(): string {
		return `rgb(${this.value.red}, ${this.value.green}, ${this.value.blue})`;
	}

	/**
	 * Convert an RGB-color to a hex-color
	 */
	static toHex(value: RGBColorValue): HexColor {
		return rgbToHex(value);
	}

	/**
	 * - Convert an RGB-color to an HSL-color
	 */
	static toHsl(rgb: RGBColorValue): HSLColor {
		return rgbToHsl(rgb);
	}
}

/**
 * Get an RGB-color from a value-object
 */
export function getRGBColor(value: RGBColorValue): RGBColor {
	return new RGBColor(value);
}
