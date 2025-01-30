import {clamp} from '../number';
import {Color} from './base';
import {hslToRgb} from './functions';
import type {HexColor} from './hex';
import type {RGBColor} from './rgb';

export type HSLColorValue = {
	hue: number;
	lightness: number;
	saturation: number;
};

export class HSLColor extends Color<HSLColorValue> {
	/**
	 * Get the current hue
	 */
	get hue(): number {
		return +this.state.value.hue;
	}

	/**
	 * Set the current hue
	 */
	set hue(value: number) {
		this.state.value.hue = clamp(value, 0, 360);
	}

	/**
	 * Get the current lightness
	 */
	get lightness(): number {
		return +this.state.value.lightness;
	}

	/**
	 * Set the current lightness
	 */
	set lightness(value: number) {
		this.state.value.lightness = clamp(value, 0, 100);
	}

	/**
	 * Get the current saturation
	 */
	get saturation(): number {
		return +this.state.value.saturation;
	}

	/**
	 * Set the current saturation
	 */
	set saturation(value: number) {
		this.state.value.saturation = clamp(value, 0, 100);
	}

	constructor(value: HSLColorValue) {
		super('hsl', value);
	}

	/**
	 * @inheritdoc
	 */
	toHex(): HexColor {
		return HSLColor.toRgb(this.state.value).toHex();
	}

	/**
	 * Convert the color to an RGB-color
	 */
	toRgb(): RGBColor {
		return HSLColor.toRgb(this.state.value);
	}

	/**
	 * @inheritdoc
	 */
	toString(): string {
		return `hsl(${this.state.value.hue}, ${this.state.value.saturation}%, ${this.state.value.lightness}%)`;
	}

	/**
	 * Convert an HSL-color to an RGB-color
	 */
	static toRgb(value: HSLColorValue): RGBColor {
		return hslToRgb(value);
	}
}

/**
 * Get an HSL-color from a value-object
 */
export function getHSLColor(value: HSLColorValue): HSLColor {
	return new HSLColor(value);
}
