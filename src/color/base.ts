import type {HexColor} from './hex';
import type {HSLColorValue} from './hsl';
import {isColorValue} from './is';
import type {RGBColorValue} from './rgb';

type Defaults = {
	hsl: HSLColorValue;
	rgb: RGBColorValue;
};

type Properties = {
	hsl: Array<keyof HSLColorValue>;
	rgb: Array<keyof RGBColorValue>;
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
		isColorValue(value, properties[type]) ? {...value} : {...defaults[type]}
	) as Model;
}

export abstract class Color<Model> {
	private declare readonly $color: keyof Properties;
	protected declare readonly state: ColorState<Model>;

	/**
	 * Get the current value of the color
	 */
	get value(): Model {
		return {...this.state.value};
	}

	/**
	 * Set the current value of the color
	 */
	set value(value: Model) {
		this.state.value = getValue(value, this.$color);
	}

	constructor(type: keyof Properties, value: Model) {
		this.$color = type;

		this.state = {
			value: getValue(value, type),
		};
	}

	/**
	 * Convert the color to a hex-color
	 */
	abstract toHex(): HexColor;

	/**
	 * Get the color as a _CSS-formatted_ string
	 */
	abstract toString(): string;
}

type ColorState<Model> = {
	value: Model;
};
