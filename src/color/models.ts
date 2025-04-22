export type HSLColor = {
	hue: number;
	lightness: number;
	saturation: number;
};

export type RGBColor = {
	blue: number;
	green: number;
	red: number;
};

export type ColorProperty =
	| 'blue'
	| 'green'
	| 'hue'
	| 'lightness'
	| 'red'
	| 'saturation';

export type ColorState = {
	hex: string;
	hsl: HSLColor;
	rgb: RGBColor;
};
