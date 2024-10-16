import type {HexColour} from '~/colour/hex';
import {isColourValue} from '~/colour/is';

export abstract class Colour<Model> {
	private declare readonly $colour: string;
	protected declare readonly state: ColourState<Model>;

	/**
	 * Get the current value of the colour
	 */
	get value(): Model {
		return {...this.state.value};
	}

	constructor(
		type: string,
		value: Model,
		defaults: Model,
		properties: Array<keyof Model>,
	) {
		this.$colour = type;

		this.state = {
			value: isColourValue<Model>(value, properties)
				? {...value}
				: {...defaults},
		};
	}

	/**
	 * Convert the colour to a hex-colour
	 */
	abstract toHex(): HexColour;

	/**
	 * Get the colour as a _CSS-formatted_ string
	 */
	abstract toString(): string;
}

type ColourState<Model> = {
	value: Model;
};
