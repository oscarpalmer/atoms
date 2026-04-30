// #region Types

export type Alpha = {
	hex: string;
	value: number;
};

type ColorWithAlpha = {
	alpha: number;
};

/**
 * An _HSL_-color with an alpha channel
 */
export type HSLAColor = HSLColor & ColorWithAlpha;

/**
 * An _HSL_-color
 */
export type HSLColor = {
	/**
	 * Hue of the color _(in degrees; 0-360)_
	 */
	hue: number;
	/**
	 * Lightness of the color _(in percentage; 0-100)_
	 */
	lightness: number;
	/**
	 * Saturation of the color _(in percentage; 0-100)_
	 */
	saturation: number;
};

/**
 * An _RGB_-color with an alpha channel
 */
export type RGBAColor = RGBColor & ColorWithAlpha;

/**
 * An _RGB_-color
 */
export type RGBColor = {
	/**
	 * Blue channel of the color _(in hexadecimal; 0-255)_
	 */
	blue: number;
	/**
	 * Green channel of the color _(in hexadecimal; 0-255)_
	 */
	green: number;
	/**
	 * Red channel of the color _(in hexadecimal; 0-255)_
	 */
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
