import {clamp} from '../number';
import {Colour} from './base';
import {rgbToHex, rgbToHsl} from './functions';
import type {HexColour} from './hex';
import type {HSLColour} from './hsl';

export type RGBColourValue = {
	blue: number;
	green: number;
	red: number;
};

export class RGBColour extends Colour<RGBColourValue> {
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

	constructor(value: RGBColourValue) {
		super('rgb', value, defaults, properties);
	}

	/**
	 * @inheritdoc
	 */
	toHex(): HexColour {
		return RGBColour.toHex(this.value);
	}

	/**
	 * Convert the colour to an HSL-colour
	 */
	toHsl(): HSLColour {
		return RGBColour.toHsl(this.value);
	}

	/**
	 * @inheritdoc
	 */
	toString(): string {
		return `rgb(${this.value.red}, ${this.value.green}, ${this.value.blue})`;
	}

	/**
	 * Convert an RGB-colour to a hex-colour
	 */
	static toHex(value: RGBColourValue): HexColour {
		return rgbToHex(value);
	}

	/**
	 * - Convert an RGB-colour to an HSL-colour
	 */
	static toHsl(rgb: RGBColourValue): HSLColour {
		return rgbToHsl(rgb);
	}
}

const defaults: RGBColourValue = {
	blue: 0,
	green: 0,
	red: 0,
};

const properties: Array<keyof RGBColourValue> = ['blue', 'green', 'red'];

/**
 * Get an RGB-colour from a value-object
 */
export function getRGBColour(value: RGBColourValue): RGBColour {
	return new RGBColour(value);
}
