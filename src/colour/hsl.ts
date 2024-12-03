import {clamp} from '../number';
import {Colour} from './base';
import {hslToRgb} from './functions';
import type {HexColour} from './hex';
import type {RGBColour} from './rgb';

export type HSLColourValue = {
	hue: number;
	lightness: number;
	saturation: number;
};

export class HSLColour extends Colour<HSLColourValue> {
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

	constructor(value: HSLColourValue) {
		super('hsl', value);
	}

	/**
	 * @inheritdoc
	 */
	toHex(): HexColour {
		return HSLColour.toRgb(this.state.value).toHex();
	}

	/**
	 * Convert the colour to an RGB-colour
	 */
	toRgb(): RGBColour {
		return HSLColour.toRgb(this.state.value);
	}

	/**
	 * @inheritdoc
	 */
	toString(): string {
		return `hsl(${this.state.value.hue}, ${this.state.value.saturation}%, ${this.state.value.lightness}%)`;
	}

	/**
	 * Convert an HSL-colour to an RGB-colour
	 */
	static toRgb(value: HSLColourValue): RGBColour {
		return hslToRgb(value);
	}
}

/**
 * Get an HSL-colour from a value-object
 */
export function getHSLColour(value: HSLColourValue): HSLColour {
	return new HSLColour(value);
}
