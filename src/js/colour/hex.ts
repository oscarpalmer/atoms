import {anyPattern, getNormalisedHex, hexToRgb} from './functions';
import type {HSLColour} from './hsl';
import type {RGBColour} from './rgb';

type State = {
	value: string;
};

export class HexColour {
	private declare readonly $colour;
	private readonly state: State;

	/**
	 * Gets the value of the colour
	 */
	get value(): string {
		return `#${this.state.value}`;
	}

	/**
	 * Sets the value of the colour
	 */
	set value(value: string) {
		this.state.value = anyPattern.test(value)
			? getNormalisedHex(value)
			: '000000';
	}

	constructor(value: string) {
		this.$colour = 'hex';

		this.state = {
			value:
				typeof value === 'string' && anyPattern.test(value)
					? getNormalisedHex(value)
					: '000000',
		};
	}

	/**
	 * Convert the colour to an RGB-colour
	 */
	toHsl(): HSLColour {
		return HexColour.toRgb(this.value).toHsl();
	}

	/**
	 * Convert the colour to an HSL-colour
	 */
	toRgb(): RGBColour {
		return HexColour.toRgb(this.value);
	}

	/**
	 * Get the colour as a string _(prefixed with #)_
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Convert a hex-colour to an RGB-colour
	 */
	static toRgb(value: string): RGBColour {
		return hexToRgb(value);
	}
}

/**
 * Get a hex-colour from a string
 */
export function getHexColour(value: string): HexColour {
	return new HexColour(value);
}
