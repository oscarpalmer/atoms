import type {Alpha, HSLAColor, HSLColor, HWBAColor, HWBColor, RGBAColor, RGBColor} from './models';

// #region Variables

export const ALPHA_FULL_HEX_SHORT = 'f';

export const ALPHA_FULL_HEX_LONG = `${ALPHA_FULL_HEX_SHORT}${ALPHA_FULL_HEX_SHORT}`;

export const ALPHA_NONE_HEX = '00';

export const ALPHA_NONE_VALUE = 0;

export const DEFAULT_ALPHA: Alpha = {
	hex: ALPHA_FULL_HEX_LONG,
	value: 100,
};

export const DEFAULT_HSL: HSLColor = {
	hue: 0,
	saturation: 0,
	lightness: 0,
};

export const DEFAULT_HWB: HWBColor = {
	hue: 0,
	whiteness: 0,
	blackness: 100,
};

export const DEFAULT_RGB: RGBColor = {
	blue: 0,
	green: 0,
	red: 0,
};

export const EXPRESSION_ALPHA_HEX = /^([a-f0-9]{1,2})$/i;

export const EXPRESSION_HEX_LONG = /^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})?$/i;

export const EXPRESSION_HEX_SHORT = /^#?([a-f0-9]{3,4})$/i;

export const EXPRESSION_PREFIX = /^#/;

export const HEX_BLACK = '000000';

export const HEX_WHITE = 'ffffff';

export const LENGTH_LONG = 6;

export const LENGTH_SHORT = 3;

export const KEYS_HSL: Array<keyof HSLColor> = ['hue', 'saturation', 'lightness'];

export const KEYS_HSLA: Array<keyof HSLAColor> = [...KEYS_HSL, 'alpha'];

export const KEYS_HWB: Array<keyof HWBColor> = ['hue', 'whiteness', 'blackness'];

export const KEYS_HWBA: Array<keyof HWBAColor> = [...KEYS_HWB, 'alpha'];

export const KEYS_RGB: Array<keyof RGBColor> = ['red', 'green', 'blue'];

export const KEYS_RGBA: Array<keyof RGBAColor> = [...KEYS_RGB, 'alpha'];

export const MAX_DEGREE = 360;

export const MAX_HEX = 255;

export const MAX_PERCENT = 100;

export const PROPERTY_COLOR = '$color';

export const TYPE_HEX = 'hex';

export const TYPE_HSL = 'hsl';

export const TYPE_HWB = 'hwb';

export const TYPE_RGB = 'rgb';

// https://www.w3.org/TR/WCAG20/#relativeluminancedef

export const SRGB_LUMINANCE_BLUE = 0.0722;

export const SRGB_LUMINANCE_EXPONENT = 2.4;

export const SRGB_LUMINANCE_GREEN = 0.7152;

export const SRGB_LUMINANCE_MINIMUM = 0.03928;

export const SRGB_LUMINANCE_MODIFIER = 1.055;

export const SRGB_LUMINANCE_MULTIPLIER = 12.92;

export const SRGB_LUMINANCE_OFFSET = 0.055;

export const SRGB_LUMINANCE_RED = 0.2126;

export const SRGB_LUMINANCE_THRESHOLD = 0.625;

// #endregion
