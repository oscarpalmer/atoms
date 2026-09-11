import {SUBSCRIPTION_NAME} from '../internal/subscription';
import type {SubscriptionProperty} from '../subscription';
import type {
	Alpha,
	ColorTypeExtended,
	HSLAColor,
	HSLColor,
	HWBAColor,
	HWBColor,
	RGBAColor,
	RGBColor,
} from './models';

// #region Types

type ColorTypes = {
	all: Set<'alpha' | ColorTypeExtended>;
	hex: 'hex';
	hexa: 'hexa';
	hsl: 'hsl';
	hsla: 'hsla';
	hwb: 'hwb';
	hwba: 'hwba';
	rgb: 'rgb';
	rgba: 'rgba';
	wildcard: '*';
};

// #endregion

// #region Variables

export const COLOR_ALPHA = {
	fullHexShort: 'f',
	fullHexLong: 'ff',
	name: 'alpha',
	noneHex: '00',
	noneValue: 0,
};

export const COLOR_DEFAULTS = {
	alpha: {
		hex: COLOR_ALPHA.fullHexLong,
		value: 100,
	},
	hexBlack: '000000',
	hexWhite: 'ffffff',
	hsl: {
		hue: 0,
		saturation: 0,
		lightness: 0,
	},
	hwb: {
		hue: 0,
		whiteness: 0,
		blackness: 100,
	},
	rgb: {
		blue: 0,
		green: 0,
		red: 0,
	},
};

export const COLOR_EXPRESSION = {
	alphaHex: /^([a-f0-9]{1,2})$/i,
	hexLong: /^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})?$/i,
	hexShort: /^#?([a-f0-9]{3,4})$/i,
	prefix: /^#/,
};

export const COLOR_LENGTHS = {
	hexLong: 6,
	hexShort: 3,
};

export const COLOR_KEYS = {
	hsl: ['hue', 'saturation', 'lightness'] as Array<keyof HSLColor>,
	hsla: [] as Array<keyof HSLAColor>,
	hwb: ['hue', 'whiteness', 'blackness'] as Array<keyof HWBColor>,
	hwba: [] as Array<keyof HWBAColor>,
	rgb: ['red', 'green', 'blue'] as Array<keyof RGBColor>,
	rgba: [] as Array<keyof RGBAColor>,
};

COLOR_KEYS.hsla = [...COLOR_KEYS.hsl, COLOR_ALPHA.name as keyof Alpha] as Array<keyof HSLAColor>;

COLOR_KEYS.hwba = [...COLOR_KEYS.hwb, COLOR_ALPHA.name as keyof Alpha] as Array<keyof HWBAColor>;

COLOR_KEYS.rgba = [...COLOR_KEYS.rgb, COLOR_ALPHA.name as keyof Alpha] as Array<keyof RGBAColor>;

export const COLOR_MAX = {
	degree: 360,
	hex: 255,
	percent: 100,
};

export const COLOR_NAME = 'color';

export const COLOR_PROPERTY = '$color';

export const COLOR_SYMBOL = Symbol(COLOR_PROPERTY);

export const COLOR_TYPE: ColorTypes = {
	all: undefined as unknown as Set<'alpha' | ColorTypeExtended>,
	hex: 'hex',
	hexa: 'hexa',
	hsl: 'hsl',
	hsla: 'hsla',
	hwb: 'hwb',
	hwba: 'hwba',
	rgb: 'rgb',
	rgba: 'rgba',
	wildcard: '*',
};

COLOR_TYPE.all = new Set([
	COLOR_ALPHA.name as 'alpha',
	COLOR_TYPE.hex,
	COLOR_TYPE.hexa,
	COLOR_TYPE.hsl,
	COLOR_TYPE.hsla,
	COLOR_TYPE.hwb,
	COLOR_TYPE.hwba,
	COLOR_TYPE.rgb,
	COLOR_TYPE.rgba,
] as Array<'alpha' | ColorTypeExtended>);

// https://www.w3.org/TR/WCAG20/#relativeluminancedef
export const COLOR_SRGB = {
	luminanceBlue: 0.0722,
	luminanceExponent: 2.4,
	luminanceGreen: 0.7152,
	luminanceMinimum: 0.03928,
	luminanceModifier: 1.055,
	luminanceMultiplier: 12.92,
	luminanceOffset: 0.055,
	luminanceRed: 0.2126,
	luminanceThreshold: 0.625,
};

export const colorSubscription: SubscriptionProperty = {
	key: COLOR_PROPERTY,
	value: SUBSCRIPTION_NAME,
};

// #endregion
