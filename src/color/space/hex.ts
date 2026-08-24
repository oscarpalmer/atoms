import {join} from '../../internal/string';
import {
	COLOR_ALPHA,
	COLOR_DEFAULTS,
	COLOR_EXPRESSION,
	COLOR_LENGTHS,
	COLOR_MAX,
	COLOR_TYPE,
} from '../constants';
import {getHexValue, getPercentage} from '../misc/get';
import {isHexColor} from '../misc/is';
import type {
	ColorState,
	ColorType,
	HSLAColor,
	HSLColor,
	HWBAColor,
	HWBColor,
	RGBAColor,
	RGBColor,
} from '../models';
import {convertRgbToHsla, convertRgbToHwba} from './rgb';

// #region Functions

function convertHexToRgba(value: string): RGBAColor {
	const normalized = getNormalizedHex(value, true);
	const pairs = COLOR_EXPRESSION.hexLong.exec(normalized) as RegExpExecArray;
	const values: number[] = [];

	const {length} = pairs;

	for (let index = 1; index < length; index += 1) {
		values.push(Number.parseInt(pairs[index], 16));
	}

	return {
		alpha: getPercentage((values[3] / COLOR_MAX.hex) * 100),
		blue: getHexValue(values[2]),
		green: getHexValue(values[1]),
		red: getHexValue(values[0]),
	};
}

export function getColorFromHex<Type extends ColorType>(
	state: ColorState,
	type: Type,
): NonNullable<ColorState[Type]> {
	switch (type) {
		case COLOR_TYPE.hsl:
			state.hsl ??= hexToHsl(state.hex!);
			break;

		case COLOR_TYPE.hwb:
			state.hwb ??= hexToHwb(state.hex!);
			break;

		case COLOR_TYPE.rgb:
			state.rgb ??= hexToRgb(state.hex!);
			break;
	}

	return state[type]!;
}

/**
 * Get the normalized hex color from a value
 *
 * _If the value is unable to be parsed or normalized, a hex color of `000000` will be returned, with the alpha channel _(opacity)_ value `0` included, if specified_
 *
 * @param value Value to normalize
 * @param alpha Include alpha channel _(opacity)_? _(defaults to `false`)_
 * @returns Normalized hex color
 */
export function getNormalizedHex(value: unknown, alpha?: boolean): string {
	const includeAlpha = alpha ?? false;

	if (!isHexColor(value)) {
		return `${COLOR_DEFAULTS.hexBlack}${includeAlpha ? COLOR_ALPHA.fullHexLong : ''}`;
	}

	const normalized = value.replace(COLOR_EXPRESSION.prefix, '');

	if (normalized.length < COLOR_LENGTHS.hexLong) {
		const hex = normalized.slice(0, COLOR_LENGTHS.hexShort);
		const a = includeAlpha ? (normalized[COLOR_LENGTHS.hexShort] ?? COLOR_ALPHA.fullHexShort) : '';

		return join(`${hex}${a}`.split('').map(character => character.repeat(2)));
	}

	const hex = normalized.slice(0, COLOR_LENGTHS.hexLong);

	const a = includeAlpha ? normalized.slice(COLOR_LENGTHS.hexLong) || COLOR_ALPHA.fullHexLong : '';

	return `${hex}${a}`;
}

/**
 * Convert a hex color string to a _HSL_ color
 *
 * _If the value is unable to be converted, a black _HSL_ color will be returned_
 *
 * @param value Hex color string
 * @returns _HSL_ color
 */
export function hexToHsl(value: string): HSLColor {
	const {hue, lightness, saturation} = hexToHsla(value);

	return {
		hue,
		lightness,
		saturation,
	};
}

/**
 * Convert a hex color string to a _HSLA_ color
 *
 * _If the value is unable to be converted, a black _HSLA_ color will be returned_
 *
 * @param value Hex color string
 * @returns _HSLA_ color
 */
export function hexToHsla(value: string): HSLAColor {
	return convertRgbToHsla(convertHexToRgba(value));
}

/**
 * Convert a hex color string to a _HWB_ color
 *
 * _If the value is unable to be converted, a black _HWB_ color will be returned_
 *
 * @param value Hex color string
 * @returns _HWB_ color
 */
export function hexToHwb(value: string): HWBColor {
	const {blackness, hue, whiteness} = hexToHwba(value);

	return {
		hue,
		whiteness,
		blackness,
	};
}

/**
 * Convert a hex color string to a _HWBA_ color
 *
 * _If the value is unable to be converted, a black _HWBA_ color will be returned_
 *
 * @param value Hex color string
 * @returns _HWBA_ color
 */
export function hexToHwba(value: string): HWBAColor {
	return convertRgbToHwba(convertHexToRgba(value));
}

/**
 * Convert a hex color to an _RGB_ color
 *
 * _If the value is unable to be converted, a black _RGB_ color will be returned_
 *
 * @param value Original value
 * @returns _RGB_ color
 */
export function hexToRgb(value: string): RGBColor {
	const {blue, green, red} = convertHexToRgba(value);

	return {blue, green, red};
}

/**
 * Convert a hex color to an _RGBA_ color
 *
 * _If the value is unable to be converted, a black _RGBA_ color will be returned_
 *
 * @param value Original value
 * @returns _RGBA_ color
 */
export function hexToRgba(value: string): RGBAColor {
	return convertHexToRgba(value);
}

// #endregion
