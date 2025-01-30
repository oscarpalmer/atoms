import {anyPattern, getNormalisedHex, hexToRgb} from './functions';
import type {HSLColor} from './hsl';
import type {RGBColor} from './rgb';

type State = {
	value: string;
};

export class HexColor {
	private declare readonly $color;
	private readonly state: State;

	/**
	 * Get the value of the color
	 */
	get value(): string {
		return `#${this.state.value}`;
	}

	/**
	 * Set the value of the color
	 */
	set value(value: string) {
		this.state.value = anyPattern.test(value)
			? getNormalisedHex(value)
			: '000000';
	}

	constructor(value: string) {
		this.$color = 'hex';

		this.state = {
			value:
				typeof value === 'string' && anyPattern.test(value)
					? getNormalisedHex(value)
					: '000000',
		};
	}

	/**
	 * Convert the color to an RGB-color
	 */
	toHsl(): HSLColor {
		return HexColor.toRgb(this.value).toHsl();
	}

	/**
	 * Convert the color to an HSL-color
	 */
	toRgb(): RGBColor {
		return HexColor.toRgb(this.value);
	}

	/**
	 * Get the color as a string _(prefixed with #)_
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Convert a hex-color to an RGB-color
	 */
	static toRgb(value: string): RGBColor {
		return hexToRgb(value);
	}
}

/**
 * Get a hex-color from a string
 */
export function getHexColor(value: string): HexColor {
	return new HexColor(value);
}
