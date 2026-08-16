// #region Types

export type Alpha = {
	hex: string;
	value: number;
};

type ColorWithAlpha = {
	/**
	 * Alpha channel _(opacity)_ of the color _(in percentage; 0-100)_
	 */
	alpha: number;
};

/**
 * An _HSL_ color with an alpha channel _(opacity)_
 */
export type HSLAColor = HSLColor & ColorWithAlpha;

/**
 * An _HSL_ color
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

export type HWBColor = {
	/**
	 * Blackness of the color _(in percentage; 0-100)_
	 */
	blackness: number;
	/**
	 * Hue of the color _(in degrees; 0-360)_
	 */
	hue: number;
	/**
	 * Whiteness of the color _(in percentage; 0-100)_
	 */
	whiteness: number;
};

export type HWBAColor = HWBColor & ColorWithAlpha;

/**
 * An _RGB_ color with an alpha channel _(opacity)_
 */
export type RGBAColor = RGBColor & ColorWithAlpha;

/**
 * An _RGB_ color
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

export type ColorProperty = 'alpha' | keyof HSLColor | keyof HWBColor | keyof RGBColor;

export type ColorSpace = 'hsl' | 'rgb';

export type ColorState = {
	alpha: Alpha;
	hex: string;
	hsl: HSLColor;
	hwb: HWBColor;
	rgb: RGBColor;
};

// #endregion
