import type {HexColour} from './hex';
import type {HSLColourValue} from './hsl';
import {isColourValue} from './is';
import type {RGBColourValue} from './rgb';

type Defaults = {
	hsl: HSLColourValue;
	rgb: RGBColourValue;
};

type Properties = {
	hsl: Array<keyof HSLColourValue>;
	rgb: Array<keyof RGBColourValue>;
};

const defaults: Defaults = {
	hsl: {
		hue: 0,
		lightness: 0,
		saturation: 0,
	},
	rgb: {
		blue: 0,
		green: 0,
		red: 0,
	},
};

const properties: Properties = {
	hsl: ['hue', 'lightness', 'saturation'],
	rgb: ['blue', 'green', 'red'],
};

function getValue<Model>(value: Model, type: keyof Properties): Model {
	return (
		isColourValue(value, properties[type]) ? {...value} : {...defaults[type]}
	) as Model;
}

export abstract class Colour<Model> {
	private declare readonly $colour: keyof Properties;
	protected declare readonly state: ColourState<Model>;

	/**
	 * Get the current value of the colour
	 */
	get value(): Model {
		return {...this.state.value};
	}

	/**
	 * Set the current value of the colour
	 */
	set value(value: Model) {
		this.state.value = getValue(value, this.$colour);
	}

	constructor(type: keyof Properties, value: Model) {
		this.$colour = type;

		this.state = {
			value: getValue(value, type),
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
