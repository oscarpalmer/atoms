// #region Types

export type Alpha = {
	hex: string;
	value: number;
};

type ColorWithAlpha = {
	alpha: number;
};

export type HSLAColor = HSLColor & ColorWithAlpha;

export type HSLColor = {
	hue: number;
	lightness: number;
	saturation: number;
};

export type RGBAColor = RGBColor & ColorWithAlpha;

export type RGBColor = {
	blue: number;
	green: number;
	red: number;
};

export type ColorProperty = 'alpha' | 'blue' | 'green' | 'hue' | 'lightness' | 'red' | 'saturation';

export type ColorSpace = 'hsl' | 'rgb';

export type ColorState = {
	alpha: Alpha;
	hex: string;
	hsl: HSLColor;
	rgb: RGBColor;
};

// #endregion
